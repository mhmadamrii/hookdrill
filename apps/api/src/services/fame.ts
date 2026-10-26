import { and, asc, desc, eq, gt, gte, sql } from 'drizzle-orm'
import { checkins, fameEvents, user, userStats, type Db } from '@hookdrill/db'
import { addDays, monthStart, utcDay } from './day'

export const CHECKIN_FAME = 10

/** +2 for each consecutive day before today, capped at +20. */
export const streakBonus = (streak: number) =>
  Math.min(2 * Math.max(streak - 1, 0), 20)

/** A streak is alive while the latest check-in is today or yesterday. */
function liveStreak(
  stats: { lastCheckinDay: string | null; currentStreak: number } | undefined,
  day: string,
) {
  if (!stats?.lastCheckinDay) return 0
  return stats.lastCheckinDay >= addDays(day, -1) ? stats.currentStreak : 0
}

/**
 * Records today's check-in and awards its fame, once per user per UTC day.
 * Returns null when the user has already checked in today.
 */
export async function checkIn(db: Db, userId: string, day = utcDay()) {
  return db.transaction(async (tx) => {
    // The primary key serialises concurrent check-ins: the loser inserts nothing.
    const fresh = await tx
      .insert(checkins)
      .values({ userId, day })
      .onConflictDoNothing()
      .returning({ day: checkins.day })
    if (fresh.length === 0) return null

    await tx.insert(userStats).values({ userId }).onConflictDoNothing()
    const [stats] = await tx
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .for('update')

    const streak =
      stats.lastCheckinDay === addDays(day, -1) ? stats.currentStreak + 1 : 1
    const amount = CHECKIN_FAME + streakBonus(streak)

    await tx.insert(fameEvents).values({ userId, kind: 'checkin', day, amount })
    await tx
      .update(userStats)
      .set({
        fame: sql`${userStats.fame} + ${amount}`,
        currentStreak: streak,
        bestStreak: sql`greatest(${userStats.bestStreak}, ${streak})`,
        lastCheckinDay: day,
        updatedAt: sql`now()`,
      })
      .where(eq(userStats.userId, userId))
    return { amount, streak }
  })
}

/** Month-to-date fame per user, as a subquery. */
function monthTotals(db: Db, day: string) {
  return db
    .select({
      userId: fameEvents.userId,
      fame: sql<number>`sum(${fameEvents.amount})::int`.as('fame'),
    })
    .from(fameEvents)
    .where(gte(fameEvents.day, monthStart(day)))
    .groupBy(fameEvents.userId)
    .as('month_totals')
}

/** Everything the check-in card and "your position" need for one user. */
export async function fameStatus(db: Db, userId: string, day = utcDay()) {
  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
  const fame = stats?.fame ?? 0
  const checkedIn = stats?.lastCheckinDay === day
  const streak = liveStreak(stats, day)

  const days = await db
    .select({ day: checkins.day })
    .from(checkins)
    .where(and(eq(checkins.userId, userId), gte(checkins.day, monthStart(day))))
    .orderBy(asc(checkins.day))

  const month = monthTotals(db, day)
  const [mine] = await db
    .select({ fame: month.fame })
    .from(month)
    .where(eq(month.userId, userId))
  const monthFame = mine?.fame ?? 0

  // Competition ranking: one more than the number of users strictly ahead.
  const [ahead] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(userStats)
    .where(gt(userStats.fame, fame))
  const [aheadMonth] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(month)
    .where(gt(month.fame, monthFame))

  return {
    day,
    fame,
    monthFame,
    rank: fame > 0 ? ahead.n + 1 : null,
    monthRank: monthFame > 0 ? aheadMonth.n + 1 : null,
    checkedIn,
    streak,
    bestStreak: stats?.bestStreak ?? 0,
    /** Fame the next check-in would award (today's, if not done yet). */
    nextAward: CHECKIN_FAME + streakBonus(streak + 1),
    monthDays: days.map((d) => d.day),
  }
}

/** The top of the fame board, all-time or for the current UTC month. */
export async function fameLeaderboard(
  db: Db,
  period: 'all' | 'month',
  viewerId: string | null,
  limit: number,
  day = utcDay(),
) {
  const yesterday = addDays(day, -1)
  const streak = sql<number>`case when ${userStats.lastCheckinDay} >= ${yesterday} then ${userStats.currentStreak} else 0 end`

  if (period === 'all') {
    const rows = await db
      .select({
        userId: userStats.userId,
        name: user.name,
        image: user.image,
        fame: userStats.fame,
        streak,
        rank: sql<number>`rank() over (order by ${userStats.fame} desc)::int`,
      })
      .from(userStats)
      .innerJoin(user, eq(user.id, userStats.userId))
      .where(gt(userStats.fame, 0))
      .orderBy(desc(userStats.fame), asc(user.name))
      .limit(limit)
    return rows.map(({ userId, ...r }) => ({ ...r, isMe: userId === viewerId }))
  }

  const month = monthTotals(db, day)
  const rows = await db
    .select({
      userId: month.userId,
      name: user.name,
      image: user.image,
      fame: month.fame,
      streak,
      rank: sql<number>`rank() over (order by ${month.fame} desc)::int`,
    })
    .from(month)
    .innerJoin(user, eq(user.id, month.userId))
    .leftJoin(userStats, eq(userStats.userId, month.userId))
    .orderBy(desc(month.fame), asc(user.name))
    .limit(limit)
  return rows.map(({ userId, ...r }) => ({ ...r, isMe: userId === viewerId }))
}
