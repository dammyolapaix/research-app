import 'dotenv/config'
import type { Config } from 'drizzle-kit'

import { env } from '@/env/server'

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  casing: 'snake_case',
  verbose: true,
  strict: true,
} satisfies Config
