import { UIMessage } from 'ai'
import { InferSelectModel } from 'drizzle-orm'

import { chats } from './schema'

export type Chat = Omit<InferSelectModel<typeof chats>, 'messages'> & {
  messages: Array<UIMessage>
}
