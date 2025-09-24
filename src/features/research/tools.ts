import { tool } from 'ai'
import { z } from 'zod'

import {
  OpenAlexParamsSchema,
  generateOpenAlexParams,
  searchPapers,
} from '@/lib/research'

export const tools = {
  generateOpenAlexParams: tool({
    description:
      'Generate OpenAlex search parameters for a given prompt. You MUST call this tool first when searching for papers.',
    inputSchema: z.object({
      prompt: z.string(),
    }),
    execute: async ({ prompt }) => {
      return generateOpenAlexParams(prompt)
    },
  }),
  searchPapers: tool({
    description:
      'Search openalex for papers about a given query. You MUST call this tool after generating OpenAlex search parameters.',
    inputSchema: OpenAlexParamsSchema,
    execute: async (query) => {
      return searchPapers(query)
    },
  }),
}
