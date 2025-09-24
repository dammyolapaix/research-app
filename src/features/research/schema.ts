import { json, pgTable, uuid } from 'drizzle-orm/pg-core'

import { timestamps } from '@/db/helper'

export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  messages: json('messages').notNull(),
  ...timestamps,
})
