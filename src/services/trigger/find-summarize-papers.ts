import { openai } from '@ai-sdk/openai'
import { logger, metadata, schemaTask } from '@trigger.dev/sdk'
import {
  Tool,
  UIDataTypes,
  UIMessage,
  UITools,
  convertToModelMessages,
  createIdGenerator,
  stepCountIs,
  streamText,
  validateUIMessages,
} from 'ai'
import { z } from 'zod'

import { getChat, saveChat } from '@/features/research/queries'
import { tools } from '@/features/research/tools'
import { RESEARCH_TOOLS_SYSTEM_PROMPT } from '@/lib/prompts'

const payloadSchema = z.object({
  prompt: z.string().min(1),
  chatId: z.uuid(),
  // How many levels of queries to generate
  depth: z.number().min(1).max(5).optional().default(2),
  // How many queries to generate for each depth level
  breadth: z.number().min(1).max(10).optional().default(2),
})

export const findAndSummarizePapersTask = schemaTask({
  id: 'find-and-summarize-papers',
  schema: payloadSchema,
  run: async ({ prompt, depth, breadth, chatId }, { ctx }) => {
    const chat = await getChat(chatId)
    console.log('Chat: ', chat)
    logger.log('Chat: ', { chat })

    const generateMessageId = createIdGenerator({
      prefix: 'msg',
      size: 16,
    })

    const message = {
      id: generateMessageId(),
      role: 'user',
      parts: [{ type: 'text', text: prompt }],
    }

    logger.log('Message: ', { message })

    // Append new message to previousMessages messages
    const messages = [...(chat?.messages ?? []), message]

    // Validate loaded messages against
    // tools, data parts schema, and metadata schema
    const validatedMessages = await validateUIMessages({
      messages,
      tools: tools as { [x: string]: Tool<unknown, unknown> | undefined }, // Ensures tool calls in messages match current schemas
    })

    console.log('Validated messages: ', validatedMessages)
    logger.log('Validated messages: ', { validatedMessages })

    const result = streamText({
      model: openai('gpt-4.1-nano'),
      system: RESEARCH_TOOLS_SYSTEM_PROMPT,
      messages: convertToModelMessages(validatedMessages),
      stopWhen: stepCountIs(5),
      tools,
      onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {},
      onFinish: async ({ response }) => {
        // Access the generated messages from response.messages
        const generatedMessages = response.messages

        // Group messages by role and combine parts appropriately
        const uiResponseMessages: UIMessage<unknown, UIDataTypes, UITools>[] =
          []
        let currentAssistantMessage: UIMessage<
          unknown,
          UIDataTypes,
          UITools
        > | null = null

        for (const msg of generatedMessages) {
          if (msg.role === 'assistant') {
            // Start a new assistant message if we don't have one or if the previous one is complete
            if (!currentAssistantMessage) {
              currentAssistantMessage = {
                id: generateMessageId(),
                role: 'assistant',
                parts: [],
              }
            }

            // Process message content
            if (typeof msg.content === 'string') {
              // Add text content
              if (msg.content.trim()) {
                currentAssistantMessage.parts.push({
                  type: 'text',
                  text: msg.content,
                  state: 'done',
                })
              }
            } else if (Array.isArray(msg.content)) {
              // Process each part
              for (const part of msg.content) {
                switch (part.type) {
                  case 'text':
                    if (part.text.trim()) {
                      currentAssistantMessage.parts.push({
                        type: 'text',
                        text: part.text,
                        state: 'done',
                      })
                    }
                    break
                  case 'tool-call':
                    // Add step-start before tool calls if this is the first tool call in the message
                    const hasStepStart = currentAssistantMessage.parts.some(
                      (p) => p.type === 'step-start'
                    )
                    if (!hasStepStart) {
                      currentAssistantMessage.parts.push({ type: 'step-start' })
                    }

                    currentAssistantMessage.parts.push({
                      type: `tool-${part.toolName}` as any,
                      toolCallId: part.toolCallId,
                      state: 'output-available',
                      input: part.input,
                    })
                    break
                  case 'reasoning':
                    currentAssistantMessage.parts.push({
                      type: 'reasoning',
                      text: part.text,
                      state: 'done',
                    })
                    break
                }
              }
            }
          } else if (msg.role === 'tool') {
            // Tool results should be added to the current assistant message
            if (currentAssistantMessage && Array.isArray(msg.content)) {
              for (const part of msg.content) {
                if (part.type === 'tool-result') {
                  // Find the corresponding tool call part and add output to it
                  const toolCallPart = currentAssistantMessage.parts.find(
                    (p) => 'toolCallId' in p && p.toolCallId === part.toolCallId
                  ) as any

                  if (toolCallPart) {
                    // Extract the actual output, removing any JSON wrapping
                    let output = (part as any).output
                    if (
                      typeof output === 'object' &&
                      output !== null &&
                      'type' in output &&
                      output.type === 'json'
                    ) {
                      output = output.value
                    }
                    toolCallPart.output = output
                  }
                }
              }
            }
          }
        }

        // Add the final assistant message if it exists
        if (
          currentAssistantMessage &&
          currentAssistantMessage.parts.length > 0
        ) {
          uiResponseMessages.push(currentAssistantMessage)
        }

        // console.log('UI response messages: ', uiResponseMessages)
        // logger.log('UI response messages: ', { uiResponseMessages })

        // Save the updated messages to the database
        const finalMessages = [...validatedMessages, ...uiResponseMessages]
        logger.log('Final messages: ', { finalMessages })
        await saveChat(chatId, finalMessages)
      },
    })

    // consume the stream to ensure it runs to completion & triggers onFinish
    // even when the client response is aborted:
    result.consumeStream() // no await

    console.log('Result: ', result)

    const stream = await metadata.stream('data', result.fullStream)

    let text = ''

    for await (const chunk of stream) {
      logger.log('Received chunk', { chunk })

      // chunk is a TextStreamPart
      if (chunk.type === 'text-delta') {
        text += chunk.text
      }
    }

    logger.log('Text: ', { text })
    console.log('Text: ', text)

    return { text }

    // const research = await deepResearch({
    //   prompt,
    //   depth,
    //   breadth,
    // })

    // const literatureReview = await generateLiteratureReview(research)

    // return {
    //   query: prompt,
    //   queries: research,
    //   searchResults: [],
    //   literatureReview,
    // }
  },
})
