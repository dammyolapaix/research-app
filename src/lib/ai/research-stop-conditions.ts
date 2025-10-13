import { StopCondition } from 'ai'

import { extractResearchId, getResearchProgress } from './research-progress'
import { tools } from './tools'

// Stop condition: All search queries have been processed
export const allQueriesProcessed: StopCondition<typeof tools> = async ({
  steps,
}) => {
  const researchId = extractResearchId(steps)
  console.log('allQueriesProcessed Research ID.................', researchId)
  if (!researchId) return false

  const progress = await getResearchProgress(researchId)
  console.log(
    'All queries processed.................',
    progress.allQueriesProcessed
  )
  return progress.allQueriesProcessed
}

// Stop condition: All papers have content extracted
export const allPapersHaveContent: StopCondition<typeof tools> = async ({
  steps,
}) => {
  const researchId = extractResearchId(steps)
  if (!researchId) return false

  const progress = await getResearchProgress(researchId)
  console.log(
    'All papers have content.................',
    progress.allPapersHaveContent
  )
  return progress.allPapersHaveContent
}

// Stop condition: All papers have been evaluated
export const allPapersEvaluated: StopCondition<typeof tools> = async ({
  steps,
}) => {
  const researchId = extractResearchId(steps)
  if (!researchId) return false

  const progress = await getResearchProgress(researchId)
  console.log(
    'All papers evaluated.................',
    progress.allPapersEvaluated
  )
  return progress.allPapersEvaluated
}

// Combined stop condition: Research is complete
export const researchComplete: StopCondition<typeof tools> = async ({
  steps,
}) => {
  const researchId = extractResearchId(steps)
  if (!researchId) return false

  const progress = await getResearchProgress(researchId)
  console.log(
    'Research complete.................',
    progress.allQueriesProcessed &&
      progress.allPapersHaveContent &&
      progress.allPapersEvaluated
  )
  return (
    progress.allQueriesProcessed &&
    progress.allPapersHaveContent &&
    progress.allPapersEvaluated
  )
}
