import { UIMessage } from 'ai'
import { relations } from 'drizzle-orm'
import { json, pgEnum, pgTable, uuid } from 'drizzle-orm/pg-core'

import { timestamps } from '@/db/helper'

export const roleEnum = pgEnum('role', ['user', 'assistant', 'system'])

export const chats = pgTable('chats', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  //   title: text().notNull().default('Untitled Chat'),
  ...timestamps,
})

export const messages = pgTable('messages', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  chatId: uuid()
    .references(() => chats.id, { onDelete: 'cascade' })
    .notNull(),
  role: roleEnum().notNull(),
  parts: json().notNull().$type<UIMessage['parts']>(),
  ...timestamps,
})

export const chatRelations = relations(chats, ({ many }) => ({
  messages: many(messages),
}))

export const messageRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}))
