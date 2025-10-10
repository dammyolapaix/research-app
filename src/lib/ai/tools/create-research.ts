import { tool } from 'ai'
import { z } from 'zod'

import { createResearch } from '@/features/research/queries'

export const createResearchTool = tool({
  description:
    'Create a new research project. This should be called first before any other research tools.',
  inputSchema: z.object({
    title: z.string().describe('The title of the research project'),
  }),
  execute: async ({ title }) => {
    const [research] = await createResearch({ title })

    return {
      data: 'Research project created successfully',
      researchId: research.id,
    }
  },
})
