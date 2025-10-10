import { openai } from '@ai-sdk/openai'
import {
  Tool,
  UIMessage,
  convertToModelMessages,
  stepCountIs,
  streamText,
  validateUIMessages,
} from 'ai'

import { getChatById, saveMessage } from '@/features/chats/queries'
import {
  createResearchTool,
  evaluatePaperTool,
  generateSearchQueriesTool,
  getPaperContentTool,
  searchPapersTool,
} from '@/lib/ai/tools'
import { RESEARCH_TOOLS_SYSTEM_PROMPT } from '@/lib/prompts'

const tools = {
  createResearch: createResearchTool,
  generateSearchQueries: generateSearchQueriesTool,
  searchPapers: searchPapersTool,
  getPaperContent: getPaperContentTool,
  evaluatePaper: evaluatePaperTool,
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { message, id }: { message: UIMessage; id: string } = await req.json()

  const chat = await getChatById(id)
  if (!chat) {
    return new Response('Chat not found', { status: 404 })
  }

  // Append new message to previousMessages messages
  const messages = [...(chat.messages ?? []), message]

  // Validate loaded messages against
  // tools, data parts schema, and metadata schema
  const validatedMessages = await validateUIMessages({
    messages,
    tools: tools as { [x: string]: Tool<unknown, unknown> | undefined }, // Ensures tool calls in messages match current schemas
  })

  console.log('Validated messages: ', validatedMessages)

  const result = streamText({
    model: openai('gpt-4.1-nano'),
    system: RESEARCH_TOOLS_SYSTEM_PROMPT,
    messages: convertToModelMessages(validatedMessages),
    stopWhen: stepCountIs(5),
    tools,
    onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
      console.log('Step finish: ')
      console.log('Text: ', text)
      console.log('Tool calls: ', toolCalls)
      console.log('Tool results: ', toolResults)
      console.log('Finish reason: ', finishReason)
      console.log('Usage: ', usage)
    },
  })

  // consume the stream to ensure it runs to completion & triggers onFinish
  // even when the client response is aborted:
  result.consumeStream() // no await

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: ({ messages }) => {
      saveMessage(
        messages.map(({ id: _, ...message }) => ({
          chatId: id,
          ...message,
        }))
      )
    },
  })
}
