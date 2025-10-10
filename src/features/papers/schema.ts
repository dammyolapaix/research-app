import { relations } from 'drizzle-orm'
import { pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { timestamps } from '@/db/helper'
import { researchPapers } from '@/db/schema'

export const papers = pgTable(
  'papers',
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    doi: text().notNull(),
    title: text().notNull(),
    url: text().notNull(),
    content: text(),
    ...timestamps,
  },
  (table) => [uniqueIndex('doi').on(table.doi)]
)

export const papersRelations = relations(papers, ({ many }) => ({
  researchPapers: many(researchPapers),
}))
