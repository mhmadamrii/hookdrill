import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2'
import * as schema from '@hookdrill/db/schema'
import { db } from './db'
import { env } from './env'

const github =
  env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
    ? { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET }
    : undefined

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  trustedOrigins: [env.WEB_ORIGIN],
  socialProviders: github ? { github } : {},
  // Local development only, so the app works before a GitHub OAuth app exists.
  emailAndPassword: { enabled: env.NODE_ENV !== 'production' },
  advanced: env.COOKIE_DOMAIN
    ? { crossSubDomainCookies: { enabled: true, domain: env.COOKIE_DOMAIN } }
    : undefined,
})

export type Session = typeof auth.$Infer.Session
