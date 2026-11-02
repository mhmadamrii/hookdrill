import { config } from 'dotenv'
import { z } from 'zod'

config({
  path: new URL('../../../.env', import.meta.url).pathname,
  quiet: true,
})

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  WEB_ORIGIN: z.string().url(),
  API_PORT: z.coerce.number().default(3001),
  GITHUB_CLIENT_ID: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  GITHUB_CLIENT_SECRET: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  COOKIE_DOMAIN: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  /** Grades design challenges. Without it, final submissions are refused. */
  GEMINI_API_KEY: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  GEMINI_MODEL: z.string().default('gemini-3.8-flash'),
  /** Development only: grade with a deterministic stub instead of Gemini. */
  DESIGN_EVAL_STUB: z
    .enum(['0', '1'])
    .optional()
    .transform((v) => v === '1'),
})

export const env = schema.parse(process.env)
