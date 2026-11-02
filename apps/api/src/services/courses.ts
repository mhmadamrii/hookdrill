import { TRPCError } from '@trpc/server'
import { and, eq, isNotNull, sql } from 'drizzle-orm'
import {
  assessments,
  courseBySlug,
  assessmentStatus,
  grade,
  hydrateLevelCourse,
  type Answers,
  type Course,
} from '@hookdrill/courses'
import { courseResults, type Db } from '@hookdrill/db'

const hydrated = new Map<string, Promise<Course>>()

/**
 * A published course with all its content loaded. Level courses load content
 * on demand in the browser; the server loads it once and keeps it.
 */
export async function availableCourse(slug: string): Promise<Course> {
  const course = courseBySlug(slug)
  if (!course || course.status !== 'available')
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Unknown course' })
  if (course.format === 'modules') return course
  let loading = hydrated.get(slug)
  if (!loading) {
    loading = hydrateLevelCourse(course)
    hydrated.set(slug, loading)
  }
  return loading
}

/** The user's results for one course. */
export function courseProgress(db: Db, userId: string, course: string) {
  return db
    .select({
      assessment: courseResults.assessment,
      attempts: courseResults.attempts,
      bestCorrect: courseResults.bestCorrect,
      total: courseResults.total,
      passed: sql<boolean>`${courseResults.passedAt} is not null`,
    })
    .from(courseResults)
    .where(
      and(eq(courseResults.userId, userId), eq(courseResults.course, course)),
    )
}

/**
 * Grades a paper on the server and records the attempt. Refuses papers for
 * assessments the user hasn't unlocked yet, so progression holds even if the
 * client is bypassed.
 */
export async function submitAssessment(
  db: Db,
  userId: string,
  courseSlug: string,
  assessmentId: string,
  answers: Answers,
) {
  const course = await availableCourse(courseSlug)
  const assessment = assessments(course).get(assessmentId)
  if (!assessment)
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Unknown assessment' })

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
  const status = assessmentStatus(course, passed, assessment.id)
  if (!status || status === 'locked' || status === 'planned')
    throw new TRPCError({
      code: 'FORBIDDEN',
      message:
        assessment.kind === 'exam'
          ? 'Pass every lesson quiz first'
          : 'Pass the prerequisites first',
    })

  const result = grade(assessment, answers)
  if (!result)
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid answers' })

  const passedAt = result.passed ? sql`now()` : null
  await db
    .insert(courseResults)
    .values({
      userId,
      course: course.slug,
      assessment: assessment.id,
      attempts: 1,
      bestCorrect: result.correct,
      total: result.total,
      passedAt,
    })
    .onConflictDoUpdate({
      target: [
        courseResults.userId,
        courseResults.course,
        courseResults.assessment,
      ],
      set: {
        attempts: sql`${courseResults.attempts} + 1`,
        bestCorrect: sql`greatest(${courseResults.bestCorrect}, ${result.correct})`,
        total: result.total,
        passedAt: sql`coalesce(${courseResults.passedAt}, ${passedAt})`,
        updatedAt: sql`now()`,
      },
    })
  return {
    ...result,
    firstPass: result.passed && !passed.has(assessment.id),
  }
}
