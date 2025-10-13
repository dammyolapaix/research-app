import { openai } from '@ai-sdk/openai'
import { Experimental_Agent as Agent } from 'ai'

import { RESEARCH_TOOLS_SYSTEM_PROMPT } from '../prompts'
// Import progress tracking
import { getResearchProgress } from './research-progress'
// Import stop conditions
import { allPapersEvaluated } from './research-stop-conditions'
import { tools } from './tools'

export const researchAgent = new Agent({
  model: openai('gpt-4.1-nano'),
  system: RESEARCH_TOOLS_SYSTEM_PROMPT,
  tools,
  stopWhen: [
    // allQueriesProcessed,
    // allPapersHaveContent,
    allPapersEvaluated,
    // stepCountIs(5), // Safety limit
  ],
  prepareStep: async ({
    model, // Current model configuration
    stepNumber, // Current step number (0-indexed)
    steps, // All previous steps with their results
    messages, // Messages to be sent to the model
  }) => {
    // Access previous tool calls and results
    const previousToolCalls = steps.flatMap((step) => step.toolCalls)
    const previousResults = steps.flatMap((step) => step.toolResults)

    console.log('Previous Tool Calls.................', previousToolCalls)
    console.log('Previous Results.................', previousResults)

    const hasCalledGetResearch = previousToolCalls.some(
      (call) => call.toolName === 'getResearch'
    )

    const hasGetResearchResult = previousResults.some(
      (result) => result.toolName === 'getResearch'
    )

    // Safety check: If we've already made too many steps, stop
    if (stepNumber > 20) {
      console.log('Too many steps, stopping agent')
      return { toolChoice: 'none' }
    }

    // console.log('Step Number.................', stepNumber)
    if (hasCalledGetResearch && hasGetResearchResult) {
      const researchId = (
        previousResults.find((result) => result.toolName === 'getResearch')
          ?.output as { researchId: string }
      ).researchId

      if (!researchId) {
        console.log('Research ID not found, stopping agent')
        return { toolChoice: 'none' }
      }

      // if (!researchId) {
      //   // First step - always start with createResearch
      //   return { toolChoice: { type: 'tool', toolName: 'createResearch' } }
      // }

      // Get current research progress
      const researchState = await getResearchProgress(researchId)

      // // Safety check: If research doesn't exist, something went wrong
      // if (!researchState.hasResearch) {
      //   console.log('Research not found, creating new research')
      //   return { toolChoice: { type: 'tool', toolName: 'createResearch' } }
      // }

      // Force tool sequence based on current state
      if (!researchState.hasQueries) {
        return {
          toolChoice: { type: 'tool', toolName: 'generateSearchQueries' },
        }
      }

      if (researchState.hasUnprocessedQueries) {
        return { toolChoice: { type: 'tool', toolName: 'searchPapers' } }
      }

      if (researchState.hasPapersWithoutContent) {
        return { toolChoice: { type: 'tool', toolName: 'getPaperContent' } }
      }

      if (researchState.hasPapersWithoutEvaluation) {
        return { toolChoice: { type: 'tool', toolName: 'evaluatePaper' } }
      }

      // If everything is complete, let the agent decide (should generate final response)
      return {}
    }
  },
})

export type ResearchAgent = typeof researchAgent
