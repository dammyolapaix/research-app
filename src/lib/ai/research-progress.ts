import {
  allPapersHaveContent as allPapersHaveContentQuery,
  getNonEvaluatedPapers,
  getNonSearchedResearchSearchQuery,
  getResearchById,
  getResearchPapersWithContent,
  getResearchPapersWithNoContent,
  hasResearchSearchQueries,
} from '@/features/research/queries'

export type ResearchProgress = {
  hasResearch: boolean
  hasQueries: boolean
  hasUnprocessedQueries: boolean
  hasPapersWithoutContent: boolean
  hasPapersWithoutEvaluation: boolean
  allQueriesProcessed: boolean
  allPapersHaveContent: boolean
  allPapersEvaluated: boolean
  totalQueries: number
  processedQueries: number
  totalPapers: number
  papersWithContent: number
  papersEvaluated: number
}

export const getResearchProgress = async (
  researchId: string
): Promise<ResearchProgress> => {
  // Check if research exists in database
  const research = await getResearchById(researchId)
  const hasResearch = research !== null

  if (!hasResearch) {
    // If research doesn't exist, return default values
    return {
      hasResearch: false,
      hasQueries: false,
      hasUnprocessedQueries: false,
      hasPapersWithoutContent: false,
      hasPapersWithoutEvaluation: false,
      allQueriesProcessed: false,
      allPapersHaveContent: false,
      allPapersEvaluated: false,
      totalQueries: 0,
      processedQueries: 0,
      totalPapers: 0,
      papersWithContent: 0,
      papersEvaluated: 0,
    }
  }

  // Check if research has queries
  const hasQueries = await hasResearchSearchQueries(researchId)
  const unprocessedQuery = await getNonSearchedResearchSearchQuery(researchId)
  const hasUnprocessedQueries = unprocessedQuery !== null

  // Get papers without content
  const papersWithoutContent = await getResearchPapersWithNoContent(researchId)
  const hasPapersWithoutContent = papersWithoutContent.length > 0

  // const allPapersHaveContent = papersWithoutContent.length === 0
  const allPapersHaveContent = await allPapersHaveContentQuery(researchId)

  // Get papers without evaluation
  const papersWithoutEvaluation = await getNonEvaluatedPapers(researchId)
  const hasPapersWithoutEvaluation = papersWithoutEvaluation.length > 0

  // Get papers with content for counting
  const papersWithContent = await getResearchPapersWithContent(researchId)
  const papersWithContentCount = papersWithContent.length

  // Calculate totals (this is approximate - we'd need more specific queries for exact counts)
  const totalPapers = papersWithoutContent.length + papersWithContentCount
  const papersEvaluated = totalPapers - papersWithoutEvaluation.length

  return {
    hasResearch,
    hasQueries,
    hasUnprocessedQueries,
    hasPapersWithoutContent,
    hasPapersWithoutEvaluation,
    allQueriesProcessed: !hasUnprocessedQueries,
    allPapersHaveContent,
    allPapersEvaluated: !hasPapersWithoutEvaluation,
    totalQueries: 3, // We always generate 3 queries
    processedQueries: hasUnprocessedQueries ? 0 : 3, // Simplified
    totalPapers,
    papersWithContent: papersWithContentCount,
    papersEvaluated,
  }
}

export const extractResearchId = (
  steps: any[],
  stepNumber?: number
): string | null => {
  // Look for researchId in step results from getResearch tool
  for (const step of steps) {
    console.log('Step Number.................', stepNumber)
    for (const part of step.content) {
      console.log('Part.................', part)
      if (part.type === 'tool-result' && part.toolName === 'getResearch') {
        const researchId = (part.output as { researchId?: string }).researchId
        if (researchId) {
          return researchId
        }
      }
    }
  }
  return null
}
