import { serve } from '@hono/node-server'
import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './auth'
import { db } from './db'
import { env } from './env'
import { appRouter } from './trpc/router'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
)

app.get('/health', (c) => c.json({ ok: true }))

app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: async (_opts, c) => ({
      db,
      session: await auth.api.getSession({ headers: c.req.raw.headers }),
    }),
  }),
)

serve({ fetch: app.fetch, port: env.API_PORT }, (info) => {
  console.log(`api listening on http://localhost:${info.port}`)
})
