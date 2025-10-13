'use server'

import { redirect } from 'next/navigation'

import { z } from 'zod'

import { saveChat } from '@/features/chats/queries'
import { createResearch } from '@/features/research/queries'

import { validatedAction } from './action-middlewares'

const researchSchema = z.object({
  prompt: z.string().min(1),
})

type Research = z.infer<typeof researchSchema>

export const researchAction = validatedAction(
  researchSchema,
  async (state: Research) => {
    console.log('Research state: ', state)

    const [research, chat] = await Promise.all([
      createResearch({}),
      saveChat({}),
    ])

    if (!research || !chat)
      return { error: 'Failed to create research or chat' }

    redirect(
      `/research/${chat.id}?prompt=${`${state.prompt} researchId: ${research.id}`}`
    )
  }
)
