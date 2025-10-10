import { InferInsertModel } from 'drizzle-orm'

import { chats, messages } from './schema'

export type InsertChat = InferInsertModel<typeof chats>

export type InsertMessage = InferInsertModel<typeof messages>
