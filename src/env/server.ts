import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production']),
    DATABASE_URL: z.url(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(10),
    OPENAI_API_KEY: z.string().min(10),
    TRIGGER_PROJECT_ID: z.string().min(10),
    TRIGGER_SECRET_KEY: z.string().min(10),
    FIRECRAWL_API_KEY: z.string().min(10),
  },

  experimental__runtimeEnv: process.env,
})
