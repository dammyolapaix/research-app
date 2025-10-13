import { notFound } from 'next/navigation'

import Chat from '@/components/chat'
import { getChatById } from '@/features/chats/queries'

type Props = {
  params: Promise<{ id: string }>
}

export default async function page({ params }: Props) {
  const { id } = await params

  const chat = await getChatById(id)

  if (!chat) return notFound()

  return (
    <div>
      <Chat id={id} initialMessages={chat?.messages ?? []} />
    </div>
  )
}
