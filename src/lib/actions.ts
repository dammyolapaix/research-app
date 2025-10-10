'use server'

import { redirect } from 'next/navigation'

import { z } from 'zod'

import { saveChat } from '@/features/chats/queries'

import { validatedAction } from './action-middlewares'

const researchSchema = z.object({
  prompt: z.string().min(1),
})

type Research = z.infer<typeof researchSchema>

export const researchAction = validatedAction(
  researchSchema,
  async (state: Research) => {
    console.log('Research state: ', state)
    const chat = await saveChat({})

    if (!chat) return { error: 'Failed to create chat' }

    // const triggerResearchRun = await tasks.trigger<
    //   typeof findAndSummarizePapersTask
    // >('find-and-summarize-papers', {
    //   prompt: state.prompt,
    //   chatId: id,
    //   depth: 2,
    //   breadth: 2,
    // })

    // await updateChat(id, {
    //   triggerRunId: triggerResearchRun.id,
    //   triggerPublicAccessToken: triggerResearchRun.publicAccessToken,
    // })

    // console.log('Research task triggered successfully: ', researchTask)

    // return { success: 'Research task triggered successfully' }

    redirect(`/research/${chat.id}?prompt=${state.prompt}`)
  }
)
