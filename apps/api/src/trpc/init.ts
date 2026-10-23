import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { Db } from '@hookdrill/db'
import type { Session } from '../auth'

export interface Context {
  db: Db
  session: Session | null
}

const t = initTRPC.context<Context>().create({ transformer: superjson })

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { ...ctx, session: ctx.session } })
})
