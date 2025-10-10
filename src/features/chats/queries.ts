import { eq } from 'drizzle-orm'

import db from '@/db'

import { chats, messages } from './schema'
import { InsertChat, InsertMessage } from './types'

export const saveChat = async (data: InsertChat) => {
  const [chat] = await db.insert(chats).values(data).returning()
  return chat
}

export const getChatById = async (id: string) => {
  const chat = await db.query.chats.findFirst({
    where: eq(chats.id, id),
    with: {
      messages: true,
    },
  })
  return chat
}

export const saveMessage = async (data: InsertMessage[]) => {
  const savedMessages = await db.insert(messages).values(data).returning()
  return savedMessages
}
