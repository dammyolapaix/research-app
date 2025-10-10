import { eq, inArray } from 'drizzle-orm'

import db from '@/db'
import { papers } from '@/db/schema'

import { InsertPaper } from './type'

export const createPapers = async (papersToCreate: InsertPaper[]) => {
  const newPapers = await db
    .insert(papers)
    .values(papersToCreate)
    .returning()
    .onConflictDoNothing()
  return newPapers
}

export const getPaperByDoi = async (doi: string) => {
  const paper = await db.query.papers.findFirst({
    where: eq(papers.doi, doi),
  })
  return paper
}

export const getPapersByDois = async (dois: string[]) => {
  const foundPapers = await db.query.papers.findMany({
    where: inArray(papers.doi, dois),
  })
  return foundPapers
}
