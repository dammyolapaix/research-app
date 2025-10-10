import { openai } from '@ai-sdk/openai'
import { generateObject, tool } from 'ai'
import z from 'zod'

import { PAPER_EVALUATIONS } from '@/features/research/constants'
import {
  evaluatePaper as evaluatePaperQuery,
  getNonEvaluatedPapers,
} from '@/features/research/queries'

const evaluatePaper = async ({
  researchId,
  query,
}: {
  researchId: string
  query: string
}) => {
  const pendingPaper = (await getNonEvaluatedPapers(researchId)).pop()

  if (!pendingPaper) return { data: 'No pending papers to evaluate' }

  const { object } = await generateObject({
    model: openai('gpt-4.1-nano'),
    schema: z.object({
      evaluation: z
        .enum(PAPER_EVALUATIONS)
        .describe('The evaluation of the paper'),
      reasoning: z
        .string()
        .describe(
          'Brief explanation of why this paper is relevant or irrelevant'
        ),
    }),
    prompt: `Evaluate whether the paper is relevant and will help answer the following query: ${JSON.stringify(query)}. 
        
    <paper>
    ${pendingPaper.paper.content}
    </paper>
    `,
  })

  await evaluatePaperQuery({
    paperId: pendingPaper.paperId,
    evaluation: object.evaluation,
    evaluationReasoning: object.reasoning,
  })

  return { data: 'Paper evaluated and saved to the database' }
}

export const evaluatePaperTool = tool({
  description:
    'Evaluate a paper for relevance. The evaluation is saved to the database.',
  inputSchema: z.object({
    researchId: z.string(),
    query: z.string(),
  }),
  execute: async ({ researchId, query }) => {
    const evaluatedPaper = await evaluatePaper({
      researchId,
      query,
    })

    return evaluatedPaper
  },
})
