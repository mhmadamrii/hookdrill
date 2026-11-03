import { TRPCError } from '@trpc/server'
import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { challenges, drafts, progress, type Db } from '@hookdrill/db'
import { dailyProblem } from '../services/daily'
import {
  contestDetail,
  listContests,
  register,
  submit,
} from '../services/contests'
import { courseProgress, submitAssessment } from '../services/courses'
import { ratingLeaderboard, ratingStatus, recordRun } from '../services/rating'
import { configuredEvaluator } from '../services/design/evaluators'
import {
  designOverview,
  getDraft,
  getSubmission,
  saveDraft,
  submitDesign,
} from '../services/design/submissions'
import { checkIn, fameLeaderboard, fameStatus } from '../services/fame'
import { protectedProcedure, publicProcedure, router } from './init'

const slug = z.string().min(1).max(100)

// Field id -> answer text. Lengths are checked against the form's limits later.
const designAnswers = z
  .record(z.string().max(40), z.string().max(10_000))
  .refine((a) => Object.keys(a).length <= 20, 'Too many fields')

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

  daily: router({
    /** Today's problem (UTC), the same for everyone. */
    today: publicProcedure.query(({ ctx }) => dailyProblem(ctx.db)),
  }),

  fame: router({
    status: protectedProcedure.query(({ ctx }) =>
      fameStatus(ctx.db, ctx.session.user.id),
    ),

    /** Once per UTC day. Returns null if the user already checked in today. */
    checkIn: protectedProcedure.mutation(({ ctx }) =>
      checkIn(ctx.db, ctx.session.user.id),
    ),
  }),

  leaderboard: router({
    fame: publicProcedure
      .input(z.object({ period: z.enum(['all', 'month']) }))
      .query(({ ctx, input }) =>
        fameLeaderboard(
          ctx.db,
          input.period,
          ctx.session?.user.id ?? null,
          100,
        ),
      ),
    rating: publicProcedure.query(({ ctx }) =>
      ratingLeaderboard(ctx.db, ctx.session?.user.id ?? null, 100),
    ),
    myRating: protectedProcedure.query(({ ctx }) =>
      ratingStatus(ctx.db, ctx.session.user.id),
    ),
  }),

  /** Contests graded in the browser; results are trusted (README caveat). */
  contests: router({
    list: publicProcedure.query(({ ctx }) =>
      listContests(ctx.db, ctx.session?.user.id ?? null),
    ),
    detail: publicProcedure
      .input(z.object({ slug }))
      .query(({ ctx, input }) =>
        contestDetail(ctx.db, input.slug, ctx.session?.user.id ?? null),
      ),
    register: protectedProcedure
      .input(z.object({ slug }))
      .mutation(({ ctx, input }) =>
        register(ctx.db, ctx.session.user.id, input.slug),
      ),
    submit: protectedProcedure
      .input(
        z.object({
          slug,
          problem: slug,
          passed: z.number().int().min(0).max(500),
          total: z.number().int().min(0).max(500),
        }),
      )
      .mutation(({ ctx, input }) =>
        submit(
          ctx.db,
          ctx.session.user.id,
          input.slug,
          input.problem,
          input.passed,
          input.total,
        ),
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
        return recordRun(
          ctx.db,
          ctx.session.user.id,
          id,
          input.passed,
          input.total,
        )
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

  courses: router({
    progress: protectedProcedure
      .input(z.object({ course: slug }))
      .query(({ ctx, input }) =>
        courseProgress(ctx.db, ctx.session.user.id, input.course),
      ),
    /** Graded here, not trusted from the browser. */
    submit: protectedProcedure
      .input(
        z.object({
          course: slug,
          assessment: z.string().min(1).max(200),
          answers: z
            .record(z.string().max(100), z.string().max(10))
            .refine((a) => Object.keys(a).length <= 50, 'Too many answers'),
        }),
      )
      .mutation(({ ctx, input }) =>
        submitAssessment(
          ctx.db,
          ctx.session.user.id,
          input.course,
          input.assessment,
          input.answers,
        ),
      ),
  }),

  /** System Design challenges: drafts, the one final submission, results. */
  design: router({
    /** Whether final submissions can be graded on this deployment. */
    grading: publicProcedure.query(() => {
      const evaluator = configuredEvaluator()
      return { available: !!evaluator, stub: evaluator?.model === 'stub' }
    }),
    draft: protectedProcedure
      .input(z.object({ course: slug, challenge: slug }))
      .query(({ ctx, input }) =>
        getDraft(ctx.db, ctx.session.user.id, input.course, input.challenge),
      ),
    saveDraft: protectedProcedure
      .input(
        z.object({ course: slug, challenge: slug, answers: designAnswers }),
      )
      .mutation(({ ctx, input }) =>
        saveDraft(
          ctx.db,
          ctx.session.user.id,
          input.course,
          input.challenge,
          input.answers,
        ),
      ),
    /** Locks the submission and grades it in the background. */
    submit: protectedProcedure
      .input(
        z.object({
          course: slug,
          challenge: slug,
          answers: designAnswers,
          idempotencyKey: z.string().uuid(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { id, evaluation } = await submitDesign(
          ctx.db,
          ctx.session.user.id,
          input.course,
          input.challenge,
          input.answers,
          input.idempotencyKey,
          configuredEvaluator(),
        )
        evaluation.catch((e) =>
          console.error('[design] evaluation crashed', id, e),
        )
        return { id }
      }),
    submission: protectedProcedure
      .input(z.object({ course: slug, challenge: slug }))
      .query(({ ctx, input }) =>
        getSubmission(
          ctx.db,
          ctx.session.user.id,
          input.course,
          input.challenge,
        ),
      ),
    overview: protectedProcedure
      .input(z.object({ course: slug }))
      .query(({ ctx, input }) =>
        designOverview(ctx.db, ctx.session.user.id, input.course),
      ),
  }),
})

export type AppRouter = typeof appRouter
