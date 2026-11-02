import { randomUUID } from 'node:crypto'
import { TRPCError } from '@trpc/server'
import { and, desc, eq, isNotNull, sql } from 'drizzle-orm'
import {
  assessmentStatus,
  challengeId,
  designFields,
  designFieldMaxLength,
  findItem,
  weakCriterionScore,
  type DesignChallenge,
  type DesignField,
  type LevelCourse,
} from '@hookdrill/courses'
import {
  courseResults,
  designDrafts,
  designEvaluations,
  designSubmissions,
  type Db,
} from '@hookdrill/db'
import { availableCourse } from '../courses'
import {
  buildPrompt,
  PROMPT_VERSION,
  validateEvaluation,
  type DesignResult,
} from './evaluation'
import type { Evaluator } from './evaluators'

/** Model calls per submission before giving up without consuming it. */
export const MAX_ATTEMPTS = 3
/** An evaluation still running after this is treated as crashed. */
export const STALE_AFTER_MS = 10 * 60_000

export type Answers = Record<DesignField, string>

/** Resolves a challenge, its content and where the learner stands on it. */
async function challengeContext(
  db: Db,
  userId: string,
  courseSlug: string,
  slug: string,
) {
  const course = await availableCourse(courseSlug)
  if (course.format !== 'levels')
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Unknown challenge' })
  const found = findItem(course, slug)
  if (found?.item.kind !== 'challenge' || !found.item.challenge)
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Unknown challenge' })
  const passedRows = await db
    .select({ assessment: courseResults.assessment })
    .from(courseResults)
    .where(
      and(
        eq(courseResults.userId, userId),
        eq(courseResults.course, course.slug),
        isNotNull(courseResults.passedAt),
      ),
    )
  const passed = new Set(passedRows.map((r) => r.assessment))
  return {
    course: course as LevelCourse,
    title: found.item.title,
    challenge: found.item.challenge as DesignChallenge,
    status: assessmentStatus(course, passed, challengeId(found.item)),
  }
}

/** Every field present, trimmed, within the length limit. */
export function cleanAnswers(
  input: Partial<Record<string, string>>,
  { complete }: { complete: boolean },
): Answers {
  const out = {} as Answers
  for (const f of designFields) {
    const value = (input[f.id] ?? '').trim()
    if (value.length > designFieldMaxLength)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `${f.label} is longer than ${designFieldMaxLength} characters`,
      })
    if (complete && !value)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Fill in ${f.label} before submitting`,
      })
    out[f.id] = value
  }
  return out
}

export async function getDraft(
  db: Db,
  userId: string,
  courseSlug: string,
  slug: string,
) {
  const { challenge } = await challengeContext(db, userId, courseSlug, slug)
  const [row] = await db
    .select({
      answers: designDrafts.answers,
      updatedAt: designDrafts.updatedAt,
    })
    .from(designDrafts)
    .where(
      and(
        eq(designDrafts.userId, userId),
        eq(designDrafts.challenge, slug),
        eq(designDrafts.version, challenge.version),
      ),
    )
  return row ?? null
}

export async function saveDraft(
  db: Db,
  userId: string,
  courseSlug: string,
  slug: string,
  input: Partial<Record<string, string>>,
) {
  const { course, challenge, status } = await challengeContext(
    db,
    userId,
    courseSlug,
    slug,
  )
  if (status !== 'open')
    throw new TRPCError({
      code: 'FORBIDDEN',
      message:
        status === 'passed'
          ? 'This challenge is already graded'
          : 'Pass the prerequisites first',
    })
  const answers = cleanAnswers(input, { complete: false })
  const [row] = await db
    .insert(designDrafts)
    .values({
      userId,
      course: course.slug,
      challenge: slug,
      version: challenge.version,
      answers,
    })
    .onConflictDoUpdate({
      target: [
        designDrafts.userId,
        designDrafts.challenge,
        designDrafts.version,
      ],
      set: { answers, updatedAt: sql`now()` },
    })
    .returning({ updatedAt: designDrafts.updatedAt })
  return row
}

/**
 * Locks the learner's one final submission and starts grading. Safe to call
 * twice: the same idempotency key returns the same submission, and a second
 * submit after grading is refused. A failed or crashed evaluation releases
 * the lock, so the attempt isn't consumed.
 *
 * Returns the submission id and the running evaluation (tests await it; the
 * API lets it finish in the background while the browser polls).
 */
export async function submitDesign(
  db: Db,
  userId: string,
  courseSlug: string,
  slug: string,
  input: Partial<Record<string, string>>,
  idempotencyKey: string,
  evaluator: Evaluator | null,
) {
  if (!evaluator)
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message:
        'AI grading isn’t available right now. Your draft is saved; submit later.',
    })
  const ctx = await challengeContext(db, userId, courseSlug, slug)
  if (ctx.status !== 'open' && ctx.status !== 'passed')
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Pass the prerequisites first',
    })
  const answers = cleanAnswers(input, { complete: true })
  const version = ctx.challenge.version

  const outcome = await db.transaction(async (tx) => {
    const fresh = await tx
      .insert(designSubmissions)
      .values({
        id: randomUUID(),
        userId,
        course: ctx.course.slug,
        challenge: slug,
        version,
        rubricVersion: ctx.challenge.rubric.version,
        answers,
        status: 'evaluating',
        idempotencyKey,
      })
      .onConflictDoNothing()
      .returning({ id: designSubmissions.id })
    if (fresh.length) return { id: fresh[0].id, start: true }

    const [row] = await tx
      .select()
      .from(designSubmissions)
      .where(
        and(
          eq(designSubmissions.userId, userId),
          eq(designSubmissions.challenge, slug),
          eq(designSubmissions.version, version),
        ),
      )
      .for('update')
    if (row.idempotencyKey === idempotencyKey && row.status !== 'failed')
      return { id: row.id, start: false }
    if (row.status === 'evaluated')
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'You’ve already submitted this challenge',
      })
    const stale = Date.now() - row.lockedAt.getTime() > STALE_AFTER_MS
    if (row.status === 'evaluating' && !stale)
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Your submission is already being graded',
      })
    // Failed or crashed: the attempt wasn't consumed, so take it again.
    await tx
      .update(designSubmissions)
      .set({
        answers,
        status: 'evaluating',
        idempotencyKey,
        rubricVersion: ctx.challenge.rubric.version,
        lockedAt: sql`now()`,
        error: null,
      })
      .where(eq(designSubmissions.id, row.id))
    return { id: row.id, start: true }
  })

  // The final answers are also the latest draft.
  await db
    .insert(designDrafts)
    .values({
      userId,
      course: ctx.course.slug,
      challenge: slug,
      version,
      answers,
    })
    .onConflictDoUpdate({
      target: [
        designDrafts.userId,
        designDrafts.challenge,
        designDrafts.version,
      ],
      set: { answers, updatedAt: sql`now()` },
    })

  const evaluation = outcome.start
    ? runEvaluation(db, outcome.id, ctx, answers, evaluator)
    : Promise.resolve()
  return { id: outcome.id, evaluation }
}

/**
 * Grades a locked submission, retrying invalid or failed model replies.
 * Every run is recorded. On success the result is stored for good; if every
 * attempt fails the submission is marked failed and can be submitted again.
 */
export async function runEvaluation(
  db: Db,
  submissionId: string,
  ctx: { title: string; challenge: DesignChallenge; course: LevelCourse },
  answers: Answers,
  evaluator: Evaluator,
) {
  const prompt = buildPrompt(ctx.title, ctx.challenge, answers)
  let lastError = 'Evaluation failed'
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const started = Date.now()
    let raw: string | null = null
    let result: DesignResult | null = null
    let error: string | null = null
    try {
      raw = await evaluator.evaluate({
        prompt,
        challenge: ctx.challenge,
        answers,
      })
      const checked = validateEvaluation(raw, ctx.challenge.rubric, answers)
      if (checked.ok) result = checked.result
      else error = checked.error
    } catch (e) {
      error = e instanceof Error ? e.message : 'Evaluator error'
    }
    await db.insert(designEvaluations).values({
      submissionId,
      attempt,
      model: evaluator.model,
      promptVersion: PROMPT_VERSION,
      rubricVersion: ctx.challenge.rubric.version,
      outcome: result ? 'valid' : raw === null ? 'error' : 'invalid',
      raw,
      error,
      durationMs: Date.now() - started,
    })
    if (result) {
      await storeResult(db, submissionId, ctx, result)
      return
    }
    lastError = error ?? lastError
  }
  await db
    .update(designSubmissions)
    .set({ status: 'failed', error: lastError })
    .where(eq(designSubmissions.id, submissionId))
}

async function storeResult(
  db: Db,
  submissionId: string,
  ctx: { challenge: DesignChallenge; course: LevelCourse },
  result: DesignResult,
) {
  await db.transaction(async (tx) => {
    const [row] = await tx
      .update(designSubmissions)
      .set({
        status: 'evaluated',
        evaluatedAt: sql`now()`,
        score: result.score,
        passed: result.passed,
        result,
        error: null,
      })
      .where(eq(designSubmissions.id, submissionId))
      .returning({
        userId: designSubmissions.userId,
        challenge: designSubmissions.challenge,
      })
    // Challenge results feed course progress like quiz results do.
    await tx
      .insert(courseResults)
      .values({
        userId: row.userId,
        course: ctx.course.slug,
        assessment: challengeId({ slug: row.challenge }),
        attempts: 1,
        bestCorrect: result.score,
        total: 100,
        passedAt: result.passed ? sql`now()` : null,
      })
      .onConflictDoUpdate({
        target: [
          courseResults.userId,
          courseResults.course,
          courseResults.assessment,
        ],
        set: {
          attempts: sql`${courseResults.attempts} + 1`,
          bestCorrect: sql`greatest(${courseResults.bestCorrect}, ${result.score})`,
          passedAt: sql`coalesce(${courseResults.passedAt}, ${result.passed ? sql`now()` : null})`,
          updatedAt: sql`now()`,
        },
      })
  })
}

/** The learner's submission for the current version, if any. */
export async function getSubmission(
  db: Db,
  userId: string,
  courseSlug: string,
  slug: string,
) {
  const { challenge } = await challengeContext(db, userId, courseSlug, slug)
  const [row] = await db
    .select({
      id: designSubmissions.id,
      status: designSubmissions.status,
      lockedAt: designSubmissions.lockedAt,
      evaluatedAt: designSubmissions.evaluatedAt,
      score: designSubmissions.score,
      passed: designSubmissions.passed,
      result: designSubmissions.result,
      answers: designSubmissions.answers,
      error: designSubmissions.error,
      version: designSubmissions.version,
      rubricVersion: designSubmissions.rubricVersion,
    })
    .from(designSubmissions)
    .where(
      and(
        eq(designSubmissions.userId, userId),
        eq(designSubmissions.challenge, slug),
        eq(designSubmissions.version, challenge.version),
      ),
    )
  if (!row) return null
  const stale =
    row.status === 'evaluating' &&
    Date.now() - row.lockedAt.getTime() > STALE_AFTER_MS
  return {
    ...row,
    // A crashed evaluation reads as failed, so the learner can resubmit.
    status: stale ? ('failed' as const) : row.status,
    result: row.result as DesignResult | null,
  }
}

/**
 * Graded submissions, newest first, plus weak areas: criteria averaging
 * under the weak threshold, with the lessons that address them.
 */
export async function designOverview(
  db: Db,
  userId: string,
  courseSlug: string,
) {
  const course = await availableCourse(courseSlug)
  if (course.format !== 'levels') return { results: [], weakAreas: [] }
  const rows = await db
    .select({
      challenge: designSubmissions.challenge,
      score: designSubmissions.score,
      passed: designSubmissions.passed,
      evaluatedAt: designSubmissions.evaluatedAt,
      result: designSubmissions.result,
    })
    .from(designSubmissions)
    .where(
      and(
        eq(designSubmissions.userId, userId),
        eq(designSubmissions.course, course.slug),
        eq(designSubmissions.status, 'evaluated'),
      ),
    )
    .orderBy(desc(designSubmissions.evaluatedAt))

  const totals = new Map<
    string,
    { title: string; sum: number; n: number; lessons: Set<string> }
  >()
  for (const r of rows) {
    const result = r.result as DesignResult
    const challenge = findItem(course, r.challenge)?.item
    const remediation =
      challenge?.kind === 'challenge'
        ? challenge.challenge?.remediation
        : undefined
    for (const e of result.evaluations) {
      const t = totals.get(e.criterion) ?? {
        title: e.title,
        sum: 0,
        n: 0,
        lessons: new Set<string>(),
      }
      t.sum += e.score
      t.n += 1
      if (e.score < weakCriterionScore)
        remediation?.[e.criterion]?.forEach((l) => t.lessons.add(l))
      totals.set(e.criterion, t)
    }
  }
  const weakAreas = [...totals.entries()]
    .map(([criterion, t]) => ({
      criterion,
      title: t.title,
      average: Math.round(t.sum / t.n),
      lessons: [...t.lessons],
    }))
    .filter((w) => w.average < weakCriterionScore)
    .sort((a, b) => a.average - b.average)

  return {
    results: rows.map((r) => ({
      challenge: r.challenge,
      title: findItem(course, r.challenge)?.item.title ?? r.challenge,
      score: r.score!,
      passed: r.passed!,
      evaluatedAt: r.evaluatedAt!,
    })),
    weakAreas,
  }
}
