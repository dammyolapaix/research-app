import { tool } from 'ai'
import { z } from 'zod'

import {
  getResearchPapers,
  getResearchPapersWithNoContent,
  updatePaperContentByUrl,
} from '@/features/research/queries'
import { batchScrape, scrape } from '@/services/firecrawl'

const getPaperContent = async (url: string, title?: string) => {
  if (title) {
    console.log(`Getting paper content for: ${title}`)
  }

  const markdown = await scrape(url)

  if (title) {
    console.log(`Got paper content for: ${title}`)
  }

  return markdown
}

export const getBatchPaperContent = async (urls: string[]) => {
  const markdown = await batchScrape(urls)
  return markdown
}

export const getPaperContentTool = tool({
  description:
    'Get a paper content from a research paper with no content. The content is saved to the database.',
  inputSchema: z.object({
    researchId: z.string().describe('The ID of the research'),
  }),
  execute: async ({ researchId }) => {
    const papersWithNoContent = await getResearchPapersWithNoContent(researchId)

    if (papersWithNoContent.length > 0) {
      const urls = papersWithNoContent.map((paper) => paper.paper.url)

      const papersWithContent = await getBatchPaperContent(urls)

      for (const paper of papersWithContent) {
        await updatePaperContentByUrl(paper.url, paper.markdown)
      }
    }

    const papers = await getResearchPapers(researchId)

    return papers.map((paper) => ({
      title: paper.paper.title,
      url: paper.paper.url,
    }))
  },
})
