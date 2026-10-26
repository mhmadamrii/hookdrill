import { eq, sql } from 'drizzle-orm'
import { challenges, dailyProblems, type Db } from '@hookdrill/db'
import { utcDay } from './day'

async function find(db: Db, day: string) {
  const [row] = await db
    .select({
      day: dailyProblems.day,
      slug: challenges.slug,
      title: challenges.title,
      difficulty: challenges.difficulty,
    })
    .from(dailyProblems)
    .innerJoin(challenges, eq(challenges.id, dailyProblems.challengeId))
    .where(eq(dailyProblems.day, day))
  return row ?? null
}

/**
 * The problem for a UTC day. A maintainer can schedule one by inserting a row;
 * otherwise the first request picks the challenge used least recently (never
 * used first, then book order) and stores it, so every visitor sees the same one.
 */
export async function dailyProblem(db: Db, day = utcDay()) {
  const existing = await find(db, day)
  if (existing) return existing

  const [pick] = await db
    .select({ id: challenges.id })
    .from(challenges)
    .leftJoin(dailyProblems, eq(dailyProblems.challengeId, challenges.id))
    .groupBy(challenges.id, challenges.position)
    .orderBy(
      sql`max(${dailyProblems.day}) asc nulls first`,
      challenges.position,
    )
    .limit(1)
  if (!pick) return null

  // A concurrent request may have filled the day first; either way, read it back.
  await db
    .insert(dailyProblems)
    .values({ day, challengeId: pick.id })
    .onConflictDoNothing()
  return find(db, day)
}
