import { InferInsertModel } from 'drizzle-orm'

import { PAPER_EVALUATIONS } from './constants'
import { researchPapers, researchSearchQueries, researches } from './schema'

export type InsertResearch = InferInsertModel<typeof researches>

export type InsertResearchSearchQueries = InferInsertModel<
  typeof researchSearchQueries
>

export type InsertResearchPapers = InferInsertModel<typeof researchPapers>

export type Evaluation = (typeof PAPER_EVALUATIONS)[number]

export type EvaluatePaper = {
  paperId: string
  evaluation: Evaluation
  evaluationReasoning: string
}
