import { json, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { timestamps } from '@/db/helper'

export const chats = pgTable('chats', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  messages: json().notNull(),
  triggerRunId: text(),
  triggerPublicAccessToken: text(),
  ...timestamps,
})
