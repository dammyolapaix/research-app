import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'

import { env } from '@/env/server'

import * as schema from './schema'

const db = drizzle(env.DATABASE_URL, {
  schema,
  casing: 'snake_case',
})

export default db
