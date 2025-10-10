import { InferInsertModel, InferSelectModel } from 'drizzle-orm'

import { papers } from '@/db/schema'

export type InsertPaper = InferInsertModel<typeof papers>
export type Paper = InferSelectModel<typeof papers>
