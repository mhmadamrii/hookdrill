import { TRPCError } from '@trpc/server'
import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { challenges, drafts, progress, type Db } from '@hookdrill/db'
import { protectedProcedure, publicProcedure, router } from './init'

const slug = z.string().min(1).max(100)

// Sandbox path -> code. Generous for hand-written components, small enough to keep rows cheap.
const files = z
  .record(z.string().regex(/^\/[\w./-]{1,100}$/), z.string())
  .refine((f) => Object.keys(f).length <= 20, 'Too many files')
  .refine(
    (f) => Object.values(f).reduce((n, code) => n + code.length, 0) <= 200_000,
    'Draft is too large',
  )

async function challengeId(db: Db, s: string) {
  const [row] = await db
    .select({ id: challenges.id })
    .from(challenges)
    .where(eq(challenges.slug, s))
  if (!row)
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Unknown challenge' })
  return row.id
}

export const appRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.session?.user ?? null),

  stats: router({
    /**
     * Per problem: how many users ran it and how many passed every test.
     * Aggregate only, so it is public. Phase 1 counts browser-verified passes.
     */
    acceptance: publicProcedure.query(({ ctx }) =>
      ctx.db
        .select({
          slug: challenges.slug,
          attempted: sql<number>`count(*)::int`,
          solved: sql<number>`count(${progress.publicPassedAt})::int`,
        })
        .from(progress)
        .innerJoin(challenges, eq(challenges.id, progress.challengeId))
        .where(sql`${progress.runs} > 0`)
        .groupBy(challenges.slug),
    ),
  }),

  progress: router({
    /** The signed-in user's progress for every challenge they have touched. */
    list: protectedProcedure.query(({ ctx }) =>
      ctx.db
        .select({
          slug: challenges.slug,
          runs: progress.runs,
          lastPassed: progress.lastPassed,
          lastTotal: progress.lastTotal,
          hintsRevealed: progress.hintsRevealed,
          publicPassedAt: progress.publicPassedAt,
          updatedAt: progress.updatedAt,
        })
        .from(progress)
        .innerJoin(challenges, eq(challenges.id, progress.challengeId))
        .where(eq(progress.userId, ctx.session.user.id)),
    ),

    /** Records one public test run. Client-reported, so it never earns points. */
    recordRun: protectedProcedure
      .input(
        z.object({
          slug,
          passed: z.number().int().min(0).max(500),
          total: z.number().int().min(0).max(500),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const id = await challengeId(ctx.db, input.slug)
        const allPassed = input.total > 0 && input.passed === input.total
        await ctx.db
          .insert(progress)
          .values({
            userId: ctx.session.user.id,
            challengeId: id,
            runs: 1,
            lastPassed: input.passed,
            lastTotal: input.total,
            publicPassedAt: allPassed ? new Date() : null,
          })
          .onConflictDoUpdate({
            target: [progress.userId, progress.challengeId],
            set: {
              runs: sql`${progress.runs} + 1`,
              lastPassed: input.passed,
              lastTotal: input.total,
              publicPassedAt: allPassed
                ? sql`coalesce(${progress.publicPassedAt}, now())`
                : sql`${progress.publicPassedAt}`,
              updatedAt: sql`now()`,
            },
          })
      }),

    /** Hints are revealed in order, so only the count is stored. */
    revealHint: protectedProcedure
      .input(z.object({ slug, count: z.number().int().min(1).max(20) }))
      .mutation(async ({ ctx, input }) => {
        const id = await challengeId(ctx.db, input.slug)
        await ctx.db
          .insert(progress)
          .values({
            userId: ctx.session.user.id,
            challengeId: id,
            hintsRevealed: input.count,
          })
          .onConflictDoUpdate({
            target: [progress.userId, progress.challengeId],
            set: {
              hintsRevealed: sql`greatest(${progress.hintsRevealed}, ${input.count})`,
              updatedAt: sql`now()`,
            },
          })
      }),
  }),

  drafts: router({
    get: protectedProcedure
      .input(z.object({ slug }))
      .query(async ({ ctx, input }) => {
        const [row] = await ctx.db
          .select({ files: drafts.files, updatedAt: drafts.updatedAt })
          .from(drafts)
          .innerJoin(challenges, eq(challenges.id, drafts.challengeId))
          .where(
            and(
              eq(drafts.userId, ctx.session.user.id),
              eq(challenges.slug, input.slug),
            ),
          )
        return row ?? null
      }),

    save: protectedProcedure
      .input(z.object({ slug, files }))
      .mutation(async ({ ctx, input }) => {
        const id = await challengeId(ctx.db, input.slug)
        const [row] = await ctx.db
          .insert(drafts)
          .values({
            userId: ctx.session.user.id,
            challengeId: id,
            files: input.files,
          })
          .onConflictDoUpdate({
            target: [drafts.userId, drafts.challengeId],
            set: { files: input.files, updatedAt: sql`now()` },
          })
          .returning({ updatedAt: drafts.updatedAt })
        return row
      }),
  }),
})

export type AppRouter = typeof appRouter
