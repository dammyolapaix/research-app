import { json, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { timestamps } from '@/db/helper'

const evaluationEnum = pgEnum('evaluation', ['relevant', 'irrelevant'])

export const chats = pgTable('chats', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  messages: json().notNull(),
  triggerRunId: text(),
  triggerPublicAccessToken: text(),
  ...timestamps,
})

export const researches = pgTable('researches', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  title: text().notNull().default('Untitled Research'),
  searchQueries: json(),
  content: text(),
  literatureReview: text(),
  ...timestamps,
})

export const papers = pgTable('papers', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  researchId: uuid()
    .references(() => researches.id, { onDelete: 'cascade' })
    .notNull(),
  title: text().notNull(),
  url: text().notNull(),
  content: text(),
  evaluation: evaluationEnum(),
  evaluationReasoning: text(),
  summary: text(),
  ...timestamps,
})
