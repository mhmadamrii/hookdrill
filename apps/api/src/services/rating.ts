import { and, asc, desc, eq, gt, isNotNull, sql } from 'drizzle-orm'
import {
  challenges,
  dailyProblems,
  fameEvents,
  progress,
  user,
  userStats,
  type Db,
} from '@hookdrill/db'
import { utcDay } from './day'

/** Fame for solving today's problem, on top of the check-in. */
export const DAILY_SOLVE_FAME = 50

/**
 * Records a browser test run. The first run that passes every test is a
 * solve: it adds the problem's points to rating and, if it's today's daily
 * problem, the daily-solve fame. Results are self-reported by the browser and
 * trusted (see the README caveat).
 */
export async function recordRun(
  db: Db,
  userId: string,
  challengeId: string,
  passed: number,
  total: number,
  day = utcDay(),
) {
  const allPassed = total > 0 && passed === total
  return db.transaction(async (tx) => {
    const [before] = await tx
      .select({ passedAt: progress.publicPassedAt })
      .from(progress)
      .where(
        and(eq(progress.userId, userId), eq(progress.challengeId, challengeId)),
      )
      .for('update')
    await tx
      .insert(progress)
      .values({
        userId,
        challengeId,
        runs: 1,
        lastPassed: passed,
        lastTotal: total,
        publicPassedAt: allPassed ? new Date() : null,
      })
      .onConflictDoUpdate({
        target: [progress.userId, progress.challengeId],
        set: {
          runs: sql`${progress.runs} + 1`,
          lastPassed: passed,
          lastTotal: total,
          publicPassedAt: allPassed
            ? sql`coalesce(${progress.publicPassedAt}, now())`
            : sql`${progress.publicPassedAt}`,
          updatedAt: sql`now()`,
        },
      })
    if (!allPassed || before?.passedAt) return { solved: false, rating: 0 }

    const [c] = await tx
      .select({ points: challenges.points })
      .from(challenges)
      .where(eq(challenges.id, challengeId))
    const [daily] = await tx
      .select({ challengeId: dailyProblems.challengeId })
      .from(dailyProblems)
      .where(eq(dailyProblems.day, day))
    let fame = 0
    if (daily?.challengeId === challengeId) {
      const fresh = await tx
        .insert(fameEvents)
        .values({
          userId,
          kind: 'daily_solve',
          day,
          amount: DAILY_SOLVE_FAME,
          ref: challengeId,
        })
        .onConflictDoNothing()
        .returning({ id: fameEvents.id })
      if (fresh.length) fame = DAILY_SOLVE_FAME
    }
    await addStats(tx as unknown as Db, userId, c.points, fame)
    return { solved: true, rating: c.points }
  })
}

/** Adds rating and fame to a user's stats row, creating it if needed. */
export async function addStats(
  db: Db,
  userId: string,
  rating: number,
  fame: number,
) {
  await db
    .insert(userStats)
    .values({
      userId,
      rating,
      fame,
      lastRatingAt: rating ? new Date() : null,
    })
    .onConflictDoUpdate({
      target: userStats.userId,
      set: {
        rating: sql`${userStats.rating} + ${rating}`,
        fame: sql`${userStats.fame} + ${fame}`,
        lastRatingAt: rating ? sql`now()` : sql`${userStats.lastRatingAt}`,
        updatedAt: sql`now()`,
      },
    })
}

/** The rating board: highest first, ties to whoever got there first. */
export async function ratingLeaderboard(
  db: Db,
  viewerId: string | null,
  limit: number,
) {
  const solved = db
    .select({
      userId: progress.userId,
      n: sql<number>`count(*)::int`.as('n'),
    })
    .from(progress)
    .where(isNotNull(progress.publicPassedAt))
    .groupBy(progress.userId)
    .as('solved')
  const rows = await db
    .select({
      userId: userStats.userId,
      name: user.name,
      image: user.image,
      rating: userStats.rating,
      solved: sql<number>`coalesce(${solved.n}, 0)`,
      rank: sql<number>`rank() over (order by ${userStats.rating} desc)::int`,
    })
    .from(userStats)
    .innerJoin(user, eq(user.id, userStats.userId))
    .leftJoin(solved, eq(solved.userId, userStats.userId))
    .where(gt(userStats.rating, 0))
    .orderBy(desc(userStats.rating), asc(userStats.lastRatingAt))
    .limit(limit)
  return rows.map(({ userId, ...r }) => ({ ...r, isMe: userId === viewerId }))
}

/** The viewer's rating and rank, for "your position". */
export async function ratingStatus(db: Db, userId: string) {
  const [stats] = await db
    .select({ rating: userStats.rating })
    .from(userStats)
    .where(eq(userStats.userId, userId))
  const rating = stats?.rating ?? 0
  const [ahead] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(userStats)
    .where(gt(userStats.rating, rating))
  return { rating, rank: rating > 0 ? ahead.n + 1 : null }
}
