import { tool } from 'ai'
import { z } from 'zod'

import {
  getResearchPaperWithNoContent,
  updatePaperContent,
} from '@/features/research/queries'
import { scrape } from '@/services/firecrawl'

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

export const getPaperContentTool = tool({
  description:
    'Get a paper content from a research paper with no content. The content is saved to the database.',
  inputSchema: z.object({
    researchId: z.string().describe('The ID of the research'),
  }),
  execute: async ({ researchId }) => {
    const paperWithNoContent = await getResearchPaperWithNoContent(researchId)

    if (!paperWithNoContent) return { data: 'No paper found with no content' }

    // Get the paper content from the URL
    const content = await getPaperContent(
      paperWithNoContent.url,
      paperWithNoContent.title
    )

    // Update the paper with the scraped content
    await updatePaperContent(paperWithNoContent.id, content)

    return { data: 'Paper content found and saved to the database' }
  },
})
