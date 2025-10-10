import Chat from '@/components/chat'
import { getChatById } from '@/features/chats/queries'

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const chat = await getChatById(id)

  return (
    <div>
      <Chat id={id} initialMessages={chat?.messages ?? []} />
    </div>
  )
}
