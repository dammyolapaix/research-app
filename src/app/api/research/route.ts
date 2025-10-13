import { Tool, UIMessage, convertToModelMessages, validateUIMessages } from 'ai'

import { getChatById, saveMessage } from '@/features/chats/queries'
import { researchAgent } from '@/lib/ai/research-agent'

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

  // Validate loaded messages against tools, data parts schema, and metadata schema
  const validatedMessages = await validateUIMessages({
    messages,
    tools: researchAgent.tools as {
      [x: string]: Tool<unknown, unknown> | undefined
    },
  })

  console.log('Validated messages: ', validatedMessages)

  // Use the research agent to handle the research workflow
  const result = researchAgent.stream({
    messages: convertToModelMessages(validatedMessages),
  })

  // consume the stream to ensure it runs to completion & triggers onFinish
  // even when the client response is aborted:
  result.consumeStream() // no await

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: ({ messages }: { messages: UIMessage[] }) => {
      saveMessage(
        messages.map(({ id: _, ...message }: UIMessage) => ({
          chatId: id,
          ...message,
        }))
      )
    },
  })
}
