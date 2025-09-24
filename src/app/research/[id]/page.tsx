import Chat from '@/components/chat'
import { getChat } from '@/features/research/queries'

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const chat = await getChat(id)

  return (
    <div>
      <Chat id={id} initialMessages={chat?.messages ?? []} />
    </div>
  )
}
