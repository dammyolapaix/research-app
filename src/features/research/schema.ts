import { relations } from 'drizzle-orm'
import {
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { timestamps } from '@/db/helper'
import { GetWorksOpenAlexParams } from '@/services/openalex/entities/works/types'

import { papers } from '../papers/schema'
import { PAPER_EVALUATIONS } from './constants'

export const evaluationEnum = pgEnum('evaluation', PAPER_EVALUATIONS)

export const researches = pgTable('researches', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  title: text().notNull().default('Untitled Research'),
  content: text(),
  literatureReview: text(),
  ...timestamps,
})

export const researchSearchQueries = pgTable('research_search_queries', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  researchId: uuid()
    .references(() => researches.id, { onDelete: 'cascade' })
    .notNull(),
  query: json().$type<GetWorksOpenAlexParams>(),
  searchedAt: timestamp({ mode: 'string', withTimezone: true }),
  ...timestamps,
})

export const researchPapers = pgTable('research_papers', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  researchId: uuid()
    .references(() => researches.id, { onDelete: 'cascade' })
    .notNull(),
  paperId: uuid()
    .references(() => papers.id, { onDelete: 'cascade' })
    .notNull(),
  evaluation: evaluationEnum(),
  evaluationReasoning: text(),
  ...timestamps,
})

// export const papers = pgTable('papers', {
//   id: uuid().primaryKey().notNull().defaultRandom(),
//   researchId: uuid()
//     .references(() => researches.id, { onDelete: 'cascade' })
//     .notNull(),
//   title: text().notNull(),
//   url: text().notNull(),
//   content: text(),
//   evaluation: evaluationEnum(),
//   evaluationReasoning: text(),
//   summary: text(),
//   ...timestamps,
// })

export const researchRelations = relations(researches, ({ many }) => ({
  papers: many(researchPapers),
  searchQueries: many(researchSearchQueries),
}))

export const researchPapersRelations = relations(researchPapers, ({ one }) => ({
  paper: one(papers, {
    fields: [researchPapers.paperId],
    references: [papers.id],
  }),
  research: one(researches, {
    fields: [researchPapers.researchId],
    references: [researches.id],
  }),
}))

export const researchSearchQueriesRelations = relations(
  researchSearchQueries,
  ({ one }) => ({
    research: one(researches, {
      fields: [researchSearchQueries.researchId],
      references: [researches.id],
    }),
  })
)
