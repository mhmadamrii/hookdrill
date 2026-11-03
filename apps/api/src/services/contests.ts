import { TRPCError } from '@trpc/server'
import { and, asc, eq, inArray, sql } from 'drizzle-orm'
import { catalog } from '@hookdrill/challenges/catalog'
import {
  CONTEST_FAME,
  WRONG_PENALTY_MINUTES,
  contestBySlug,
  contestPhase,
  contests,
  placementMultiplier,
  type Contest,
} from '@hookdrill/challenges/contests'
import {
  contestRegistrations,
  contestResults,
  contestSubmissions,
  fameEvents,
  user,
  type Db,
} from '@hookdrill/db'
import { utcDay } from './day'
import { addStats } from './rating'

function find(slug: string) {
  const contest = contestBySlug(slug)
  if (!contest)
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Unknown contest' })
  return contest
}

export interface Standing {
  userId: string
  name: string
  image: string | null
  rank: number
  solved: number
  penalty: number
  /** Per problem label: minutes to accept (or null) and rejected tries. */
  problems: Record<string, { minutes: number | null; wrong: number }>
}

/** ICPC standings from raw submits: solved desc, then penalty asc. */
async function computeStandings(db: Db, contest: Contest): Promise<Standing[]> {
  const subs = await db
    .select({
      userId: contestSubmissions.userId,
      problem: contestSubmissions.problem,
      accepted: contestSubmissions.accepted,
      at: contestSubmissions.createdAt,
      name: user.name,
      image: user.image,
    })
    .from(contestSubmissions)
    .innerJoin(user, eq(user.id, contestSubmissions.userId))
    .where(eq(contestSubmissions.contest, contest.slug))
    .orderBy(asc(contestSubmissions.createdAt))
  const start = Date.parse(contest.startsAt)
  const byUser = new Map<string, Standing>()
  for (const s of subs) {
    const row =
      byUser.get(s.userId) ??
      ({
        userId: s.userId,
        name: s.name,
        image: s.image,
        rank: 0,
        solved: 0,
        penalty: 0,
        problems: {},
      } satisfies Standing)
    const label = contest.problems.find((p) => p.slug === s.problem)!.label
    const cell = (row.problems[label] ??= { minutes: null, wrong: 0 })
    if (cell.minutes === null) {
      if (s.accepted) {
        cell.minutes = Math.floor((s.at.getTime() - start) / 60_000)
        row.solved += 1
        row.penalty += cell.minutes + cell.wrong * WRONG_PENALTY_MINUTES
      } else cell.wrong += 1
    }
    byUser.set(s.userId, row)
  }
  const rows = [...byUser.values()].sort(
    (a, b) => b.solved - a.solved || a.penalty - b.penalty,
  )
  rows.forEach((r, i) => {
    const prev = rows[i - 1]
    r.rank =
      prev && prev.solved === r.solved && prev.penalty === r.penalty
        ? prev.rank
        : i + 1
  })
  return rows
}

/**
 * Writes final results the first time a finished contest is read: rank,
 * rating (points of solved problems × placement multiplier) and the
 * participation fame. An advisory lock makes concurrent readers wait, so it
 * runs once.
 */
async function finalize(db: Db, contest: Contest) {
  await db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${contest.slug}))`,
    )
    const [done] = await tx
      .select({ userId: contestResults.userId })
      .from(contestResults)
      .where(eq(contestResults.contest, contest.slug))
      .limit(1)
    if (done) return
    const standings = await computeStandings(tx as unknown as Db, contest)
    if (!standings.length) return
    const day = utcDay(new Date(contest.startsAt))
    for (const s of standings) {
      const points = contest.problems
        .filter((p) => s.problems[p.label]?.minutes != null)
        .reduce((n, p) => n + p.points, 0)
      const rating = Math.round(
        points * placementMultiplier(s.rank, standings.length),
      )
      await tx.insert(contestResults).values({
        userId: s.userId,
        contest: contest.slug,
        rank: s.rank,
        solved: s.solved,
        penalty: s.penalty,
        ratingAwarded: rating,
      })
      const fresh = await tx
        .insert(fameEvents)
        .values({
          userId: s.userId,
          kind: 'contest',
          day,
          amount: CONTEST_FAME,
          ref: contest.slug,
        })
        .onConflictDoNothing()
        .returning({ id: fameEvents.id })
      await addStats(
        tx as unknown as Db,
        s.userId,
        rating,
        fresh.length ? CONTEST_FAME : 0,
      )
    }
  })
}

async function standingsFor(db: Db, contest: Contest) {
  if (contestPhase(contest) !== 'ended') return computeStandings(db, contest)
  await finalize(db, contest)
  const final = await db
    .select({
      userId: contestResults.userId,
      rating: contestResults.ratingAwarded,
    })
    .from(contestResults)
    .where(eq(contestResults.contest, contest.slug))
  const awarded = new Map(final.map((r) => [r.userId, r.rating]))
  return (await computeStandings(db, contest)).map((s) => ({
    ...s,
    ratingAwarded: awarded.get(s.userId) ?? 0,
  }))
}

const titles = new Map(catalog.map((c) => [c.slug, c]))

export async function listContests(db: Db, viewerId: string | null) {
  const mine = viewerId
    ? await db
        .select({ contest: contestRegistrations.contest })
        .from(contestRegistrations)
        .where(eq(contestRegistrations.userId, viewerId))
    : []
  const registered = new Set(mine.map((r) => r.contest))
  const counts = await db
    .select({
      contest: contestRegistrations.contest,
      n: sql<number>`count(*)::int`,
    })
    .from(contestRegistrations)
    .groupBy(contestRegistrations.contest)
  const n = new Map(counts.map((c) => [c.contest, c.n]))
  return contests.map((c) => ({
    slug: c.slug,
    title: c.title,
    startsAt: c.startsAt,
    durationMinutes: c.durationMinutes,
    phase: contestPhase(c),
    problems: c.problems.length,
    registered: registered.has(c.slug),
    registrations: n.get(c.slug) ?? 0,
  }))
}

export async function contestDetail(
  db: Db,
  slug: string,
  viewerId: string | null,
) {
  const contest = find(slug)
  const phase = contestPhase(contest)
  const [reg] = viewerId
    ? await db
        .select({ at: contestRegistrations.createdAt })
        .from(contestRegistrations)
        .where(
          and(
            eq(contestRegistrations.userId, viewerId),
            eq(contestRegistrations.contest, slug),
          ),
        )
    : []
  const standings = await standingsFor(db, contest)
  const me = standings.find((s) => s.userId === viewerId)
  return {
    slug: contest.slug,
    title: contest.title,
    startsAt: contest.startsAt,
    durationMinutes: contest.durationMinutes,
    phase,
    registered: !!reg,
    // Problems are shown once the round starts; before that, only how many.
    problems:
      phase === 'upcoming'
        ? []
        : contest.problems.map((p) => ({
            ...p,
            title: titles.get(p.slug)?.title ?? p.slug,
            difficulty: titles.get(p.slug)?.difficulty ?? 'medium',
            mine: me?.problems[p.label] ?? null,
          })),
    problemCount: contest.problems.length,
    standings: standings.slice(0, 100).map(({ userId, ...s }) => ({
      ...s,
      isMe: userId === viewerId,
    })),
    myRank: me?.rank ?? null,
  }
}

export async function register(db: Db, userId: string, slug: string) {
  const contest = find(slug)
  if (contestPhase(contest) === 'ended')
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'This contest ended' })
  await db
    .insert(contestRegistrations)
    .values({ userId, contest: slug })
    .onConflictDoNothing()
}

/**
 * Records a contest submit from the browser's test run. Counts only while
 * the round is live, for registered users, for the contest's own problems.
 */
export async function submit(
  db: Db,
  userId: string,
  slug: string,
  problem: string,
  passed: number,
  total: number,
) {
  const contest = find(slug)
  if (contestPhase(contest) !== 'live')
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Submissions are only accepted while the contest is live',
    })
  if (!contest.problems.some((p) => p.slug === problem))
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Not in this contest' })
  const [reg] = await db
    .select({ userId: contestRegistrations.userId })
    .from(contestRegistrations)
    .where(
      and(
        eq(contestRegistrations.userId, userId),
        eq(contestRegistrations.contest, slug),
      ),
    )
  if (!reg)
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Register first' })
  const accepted = total > 0 && passed === total
  await db
    .insert(contestSubmissions)
    .values({ userId, contest: slug, problem, accepted, passed, total })
  return { accepted }
}

/** Contest rating history for a profile. */
export async function userContestResults(db: Db, userId: string) {
  const rows = await db
    .select()
    .from(contestResults)
    .where(
      and(
        eq(contestResults.userId, userId),
        inArray(
          contestResults.contest,
          contests.map((c) => c.slug),
        ),
      ),
    )
  return rows.map((r) => ({
    ...r,
    title: contestBySlug(r.contest)?.title ?? r.contest,
  }))
}
