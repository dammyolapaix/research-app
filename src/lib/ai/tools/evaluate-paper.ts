import { openai } from '@ai-sdk/openai'
import { generateObject, tool } from 'ai'
import z from 'zod'

import { PAPER_EVALUATIONS } from '@/features/research/constants'
import {
  evaluatePaper as evaluatePaperQuery,
  getNonEvaluatedPapers,
  getResearchPaperById,
} from '@/features/research/queries'

const evaluatePaper = async ({
  researchId,
  query,
}: {
  researchId: string
  query: string
}) => {
  const pendingResearchPaper = (await getNonEvaluatedPapers(researchId)).pop()

  if (!pendingResearchPaper) return { data: 'No pending paper to evaluate' }

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
      ${pendingResearchPaper.paper.content}
      </paper>
      `,
  })

  await evaluatePaperQuery({
    paperId: pendingResearchPaper.id,
    evaluation: object.evaluation,
    evaluationReasoning: object.reasoning,
  })

  const researchPaper = await getResearchPaperById(pendingResearchPaper.id)

  if (!researchPaper) return { data: 'Paper not found' }

  return {
    title: researchPaper.paper.title,
    url: researchPaper.paper.url,
    evaluation: researchPaper.evaluation,
    evaluationReasoning: researchPaper.evaluationReasoning,
  }
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
