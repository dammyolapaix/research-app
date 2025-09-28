'use server'

import { tasks } from '@trigger.dev/sdk'
import { z } from 'zod'

import { createChat, updateChat } from '@/features/research/queries'
import { findAndSummarizePapersTask } from '@/services/trigger/find-summarize-papers'

import { validatedAction } from './action-middlewares'

const researchSchema = z.object({
  prompt: z.string().min(1),
})

type Research = z.infer<typeof researchSchema>

export const researchAction = validatedAction(
  researchSchema,
  async (state: Research) => {
    console.log('Research state: ', state)
    const id = await createChat()

    if (!id) return { error: 'Failed to create chat' }

    const triggerResearchRun = await tasks.trigger<
      typeof findAndSummarizePapersTask
    >('find-and-summarize-papers', {
      prompt: state.prompt,
      chatId: id,
      depth: 2,
      breadth: 2,
    })

    await updateChat(id, {
      triggerRunId: triggerResearchRun.id,
      triggerPublicAccessToken: triggerResearchRun.publicAccessToken,
    })

    // console.log('Research task triggered successfully: ', researchTask)

    return { success: 'Research task triggered successfully' }

    // redirect(`/research/${id}?prompt=${state.prompt}`)
  }
)
