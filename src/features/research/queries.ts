import { UIMessage } from 'ai'
import { eq } from 'drizzle-orm'

import db from '@/db'

import { chats } from './schema'
import { Chat } from './types'

export const createChat = async () => {
  const [chat] = await db.insert(chats).values({ messages: [] }).returning()

  if (!chat) return null

  return chat.id
}

export const getChat = async (id: string): Promise<Chat | null> => {
  const chat = await db.query.chats.findFirst({
    where: eq(chats.id, id),
  })

  return chat as Chat | null
}

export const saveChat = async (id: string, messages: UIMessage[]) => {
  await db.update(chats).set({ messages }).where(eq(chats.id, id))
}
