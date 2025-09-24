'use server'

import { redirect } from 'next/navigation'

import { z } from 'zod'

import { createChat } from '@/features/research/queries'

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

    // const researchTask = await tasks.trigger<typeof findAndSummarizePapersTask>(
    //   'find-and-summarize-papers',
    //   {
    //     prompt: state.prompt,
    //     depth: 2,
    //     breadth: 2,
    //   }
    // )

    // console.log('Research task triggered successfully: ', researchTask)

    redirect(`/research/${id}?prompt=${state.prompt}`)
  }
)
