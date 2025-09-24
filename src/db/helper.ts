import { timestamp } from 'drizzle-orm/pg-core'

export const timestamps = {
  createdAt: timestamp({ mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp({ mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date().toISOString()),
  deletedAt: timestamp({ mode: 'string', withTimezone: true }),
}
