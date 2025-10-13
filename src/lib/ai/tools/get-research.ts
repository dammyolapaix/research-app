import { tool } from 'ai'
import { z } from 'zod'

import { getResearchById } from '@/features/research/queries'

export const getResearchTool = tool({
  description:
    'Get a research project by ID. This should be called before any other research tools.',
  inputSchema: z.object({
    researchId: z.string().describe('The ID of the research project'),
  }),
  execute: async ({ researchId }) => {
    const research = await getResearchById(researchId)

    if (!research) return { data: 'Research project not found' }

    return {
      data: 'Research project found successfully',
      researchId: research.id,
    }
  },
})
