import 'server-only'

import { and, eq, isNotNull, isNull } from 'drizzle-orm'

import db from '@/db'
import {
  papers,
  researchPapers,
  researchSearchQueries,
  researches,
} from '@/db/schema'

import { createPapers, getPapersByDois } from '../papers/queries'
import { InsertPaper } from '../papers/type'
import {
  EvaluatePaper,
  InsertResearch,
  InsertResearchPapers,
  InsertResearchSearchQueries,
} from './types'

export const createResearch = async (data: InsertResearch) => {
  const [research] = await db.insert(researches).values(data).returning()
  return research
}

export const getResearchById = async (researchId: string) => {
  const research = await db.query.researches.findFirst({
    where: eq(researches.id, researchId),
  })
  return research
}

export const hasResearchSearchQueries = async (researchId: string) => {
  const searchQueries = await db.query.researchSearchQueries.findFirst({
    where: eq(researchSearchQueries.researchId, researchId),
  })
  return searchQueries !== null
}

export const saveResearchSearchQueries = async (
  data: InsertResearchSearchQueries[]
) => {
  const searchQueries = await db
    .insert(researchSearchQueries)
    .values(data)
    .returning()
  return searchQueries
}

export const getNonSearchedResearchSearchQuery = async (researchId: string) => {
  const searchQueries = await db.query.researchSearchQueries.findFirst({
    where: and(
      eq(researchSearchQueries.researchId, researchId),
      isNotNull(researchSearchQueries.query),
      isNull(researchSearchQueries.searchedAt)
    ),
  })

  if (!searchQueries) return null

  return searchQueries
}

export const markResearchSearchQueryAsSearched = async (id: string) => {
  const [searchQueries] = await db
    .update(researchSearchQueries)
    .set({ searchedAt: new Date().toISOString() })
    .where(eq(researchSearchQueries.id, id))
    .returning()

  return searchQueries
}

export const saveResearchPapers = async (data: InsertResearchPapers[]) => {
  const papers = await db
    .insert(researchPapers)
    .values(data)
    .returning()
    .onConflictDoNothing()

  return papers
}

export const prepareResearchPapersToSave = async ({
  researchId,
  searchResultsPapers,
}: {
  researchId: string
  searchResultsPapers: InsertPaper[]
}) => {
  const dois = searchResultsPapers.map((paper) => paper.doi)
  const papersFromDb = await getPapersByDois(dois)

  // Find papers that don't exist in the database
  const missingPapers = searchResultsPapers.filter(
    (paper) => !papersFromDb.find((p) => p.doi === paper.doi)
  )

  // Create missing papers in batch without the content
  if (missingPapers.length > 0) {
    await createPapers(missingPapers)
  }

  // Get all papers after creation (existing + newly created)
  const allPapersFromDb = await getPapersByDois(dois)

  // Map search results to include paperId
  const papersToSave = searchResultsPapers.map((paper) => {
    const paperFromDb = allPapersFromDb.find((p) => p.doi === paper.doi)

    if (!paperFromDb) {
      throw new Error(`Paper with DOI ${paper.doi} not found after creation`)
    }

    return {
      researchId,
      paperId: paperFromDb.id,
    }
  })

  return papersToSave
}

export const getNonEvaluatedPapers = async (researchId: string) => {
  const papers = await db.query.researchPapers.findMany({
    where: and(
      eq(researchPapers.researchId, researchId),
      isNull(researchPapers.evaluation)
    ),
    with: {
      paper: true,
    },
  })
  return papers
}

export const evaluatePaper = async ({
  paperId,
  evaluation,
  evaluationReasoning,
}: EvaluatePaper) => {
  const [paper] = await db
    .update(researchPapers)
    .set({ evaluation, evaluationReasoning })
    .where(eq(researchPapers.id, paperId))
    .returning()

  return paper
}

export const getResearchPapers = async (researchId: string) => {
  const papers = await db.query.researchPapers.findMany({
    where: eq(researchPapers.researchId, researchId),
    with: {
      paper: true,
    },
  })
  return papers
}

export const allPapersHaveContent = async (researchId: string) => {
  console.log('checking all papers have content.................', researchId)
  const papers = await getResearchPapers(researchId)
  console.log('papers.................', papers)

  // If no papers exist, return false
  if (papers.length === 0) return false

  return papers.every((researchPaper) => {
    const content = researchPaper.paper.content
    console.log('content.................', content)
    return content && content.trim() !== ''
  })
}

export const getResearchPapersWithNoContent = async (researchId: string) => {
  // Get all research papers for this research with their associated paper data
  const papers = await getResearchPapers(researchId)

  // Filter papers that have no content (null, undefined, or empty string)
  return papers.filter((researchPaper) => {
    const content = researchPaper.paper.content
    return !content || content.trim() === ''
  })
}

export const getResearchPaperWithNoContent = async (researchId: string) => {
  const papersWithNoContent = await getResearchPapersWithNoContent(researchId)
  return papersWithNoContent.length > 0 ? papersWithNoContent[0].paper : null
}

export const getResearchPapersWithContent = async (researchId: string) => {
  // Get all research papers for this research with their associated paper data
  const allPapers = await db.query.researchPapers.findMany({
    where: eq(researchPapers.researchId, researchId),
    with: {
      paper: true,
    },
  })

  // Filter papers that have content (not null, undefined, or empty string)
  return allPapers.filter((researchPaper) => {
    const content = researchPaper.paper.content
    return content && content.trim() !== ''
  })
}

export const updatePaperContentByUrl = async (url: string, content: string) => {
  const [updatedPaper] = await db
    .update(papers)
    .set({ content })
    .where(eq(papers.url, url))
    .returning()

  return updatedPaper
}
