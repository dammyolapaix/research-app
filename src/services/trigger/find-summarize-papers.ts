import { logger, metadata, schemaTask } from '@trigger.dev/sdk'
import { z } from 'zod'

import { deepResearch, generateLiteratureReview } from '@/lib/research'

const payloadSchema = z.object({
  prompt: z.string().min(1),
  // How many levels of queries to generate
  depth: z.number().min(1).max(5).optional().default(2),
  // How many queries to generate for each depth level
  breadth: z.number().min(1).max(10).optional().default(2),
})

export const findAndSummarizePapersTask = schemaTask({
  id: 'find-and-summarize-papers',
  schema: payloadSchema,
  run: async ({ prompt, depth, breadth }, { ctx }) => {
    metadata.set('status', {
      progress: 0,
      label: `Continuing Research...`,
    })

    const research = await deepResearch({
      prompt,
      depth,
      breadth,
    })

    // console.log("Research: ", research);
    // logger.info(`Research: ${research}`);

    console.log(`Research complete. Generating Literature Review... ${prompt}`)
    logger.info(`Research complete. Generating Literature Review... ${prompt}`)

    metadata.set('status', {
      progress: 50,
      label: `Research complete. Generating Literature Review... ${prompt}`,
    })

    const literatureReview = await generateLiteratureReview(research)

    metadata.set('status', {
      progress: 100,
      label: `Literature Review complete.`,
    })

    return {
      query: prompt,
      queries: research,
      searchResults: [],
      literatureReview,
    }
  },
})
