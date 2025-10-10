import { tool } from 'ai'
import z from 'zod'

import {
  getNonSearchedResearchSearchQuery,
  markResearchSearchQueryAsSearched,
  prepareResearchPapersToSave,
  saveResearchPapers,
} from '@/features/research/queries'
import { OpenAlexParams, WorksFilters, openAlex } from '@/services/openalex'

export const searchPapers = async (
  params: OpenAlexParams<WorksFilters, {}, {}>
) => {
  const data = await openAlex.works.get(params)

  const papers = data.results
    .filter((paper) => {
      const hasPdfUrl =
        paper.primary_location?.pdf_url &&
        paper.primary_location.pdf_url !== null &&
        paper.primary_location.pdf_url !== undefined &&
        paper.primary_location.pdf_url.length > 0

      const hasOaUrl =
        paper.open_access?.oa_url &&
        paper.open_access.oa_url !== null &&
        paper.open_access.oa_url !== undefined &&
        paper.open_access.oa_url.length > 0

      return hasPdfUrl || hasOaUrl
    })
    .map((paper) => {
      const pdfUrl = paper.primary_location?.pdf_url
      const oaUrl = paper.open_access?.oa_url

      // Prefer PDF URL if available, otherwise use OA URL
      const url = pdfUrl && pdfUrl.length > 0 ? pdfUrl : oaUrl!

      return {
        title: paper.title,
        url,
        doi: paper.doi!,
      }
    })

  return papers
}

export const searchPapersTool = tool({
  description:
    'Search openalex for papers about a given query. The results are saved to the database.',
  inputSchema: z.object({
    researchId: z.string(),
  }),
  execute: async ({ researchId }) => {
    const query = await getNonSearchedResearchSearchQuery(researchId)

    if (!query) return { data: 'No search queries found for the research' }

    const searchResultsPapers = await searchPapers(query.query!)

    const papersToSave = await prepareResearchPapersToSave({
      researchId,
      searchResultsPapers,
    })

    await Promise.all([
      saveResearchPapers(papersToSave),
      markResearchSearchQueryAsSearched(query.id),
    ])

    return { data: 'Papers searched and saved to the database' }
  },
})
