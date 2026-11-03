/**
 * Integration tests for practice rating and contests against a disposable
 * Postgres. Refuses to run unless the database name ends in "_test".
 *
 *   DATABASE_URL=postgres://…/hookdrill_test pnpm --filter @hookdrill/api test:contests
 */
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { eq, sql } from 'drizzle-orm'
import { contests } from '@hookdrill/challenges/contests'
import {
  challenges,
  contestSubmissions,
  createDb,
  dailyProblems,
  fameEvents,
  user,
  userStats,
} from '@hookdrill/db'

const url = process.env.DATABASE_URL ?? ''
if (!/\/[\w-]+_test(\?|$)/.test(url)) {
  console.error('Refusing to run: DATABASE_URL must point at a *_test database')
  process.exit(1)
}
const db = createDb(url)

// A live round and a finished one, built around now.
const now = Date.now()
contests.push(
  {
    slug: 't-live',
    title: 'Test live',
    startsAt: new Date(now - 10 * 60_000).toISOString(),
    durationMinutes: 90,
    problems: [
      { label: 'A', slug: 'star-rating', points: 20 },
      { label: 'B', slug: 'accordion', points: 30 },
    ],
  },
  {
    slug: 't-ended',
    title: 'Test ended',
    startsAt: new Date(now - 200 * 60_000).toISOString(),
    durationMinutes: 90,
    problems: [
      { label: 'A', slug: 'star-rating', points: 20 },
      { label: 'B', slug: 'accordion', points: 30 },
    ],
  },
)
const { recordRun, ratingLeaderboard } = await import('../src/services/rating')
const { contestDetail, register, submit } =
  await import('../src/services/contests')

let failed = 0
async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    console.log(`ok   ${name}`)
  } catch (e) {
    failed++
    console.error(`FAIL ${name}\n     ${(e as Error).stack ?? e}`)
  }
}
async function makeUser(name = 'Tester') {
  const id = `test-${randomUUID()}`
  await db
    .insert(user)
    .values({ id, name, email: `${id}@example.test`, emailVerified: true })
  return id
}
const idOf = async (slug: string) =>
  (await db.select().from(challenges).where(eq(challenges.slug, slug)))[0]
const stats = async (u: string) =>
  (await db.select().from(userStats).where(eq(userStats.userId, u)))[0]

await test('first full pass adds points once; later passes add nothing', async () => {
  const u = await makeUser()
  const c = await idOf('accordion')
  assert.deepEqual(await recordRun(db, u, c.id, 3, 5), {
    solved: false,
    rating: 0,
  })
  assert.equal((await recordRun(db, u, c.id, 5, 5)).rating, c.points)
  assert.equal((await recordRun(db, u, c.id, 5, 5)).solved, false)
  assert.equal((await stats(u)).rating, c.points)
})

await test("solving today's daily problem adds +50 fame once", async () => {
  const u = await makeUser()
  const c = await idOf('todo-list')
  const day = new Date().toISOString().slice(0, 10)
  await db
    .insert(dailyProblems)
    .values({ day, challengeId: c.id })
    .onConflictDoUpdate({
      target: dailyProblems.day,
      set: { challengeId: c.id },
    })
  await recordRun(db, u, c.id, 4, 4)
  assert.equal((await stats(u)).fame, 50)
  const events = await db
    .select()
    .from(fameEvents)
    .where(eq(fameEvents.userId, u))
  assert.equal(events.length, 1)
})

await test('rating board ranks by rating', async () => {
  const board = await ratingLeaderboard(db, null, 100)
  assert.ok(board.length >= 2)
  assert.ok(board[0].rating >= board[1].rating)
})

await test('contest submit needs a live round, registration, and its own problem', async () => {
  const u = await makeUser()
  await assert.rejects(submit(db, u, 't-live', 'star-rating', 1, 1), /Register/)
  await register(db, u, 't-live')
  await assert.rejects(
    submit(db, u, 't-live', 'todo-list', 1, 1),
    /Not in this contest/,
  )
  await assert.rejects(
    submit(db, u, 't-ended', 'star-rating', 1, 1),
    /only accepted while/,
  )
  await assert.rejects(register(db, u, 't-ended'), /ended/)
  assert.deepEqual(await submit(db, u, 't-live', 'star-rating', 2, 3), {
    accepted: false,
  })
  assert.deepEqual(await submit(db, u, 't-live', 'star-rating', 3, 3), {
    accepted: true,
  })
  const d = await contestDetail(db, 't-live', u)
  const me = d.standings.find((s) => s.isMe)!
  assert.equal(me.solved, 1)
  assert.equal(me.problems.A.wrong, 1)
  // About 10 minutes in, plus 5 for the wrong try.
  assert.ok(me.penalty >= 14 && me.penalty <= 16, `penalty ${me.penalty}`)
})

await test('ended contest: ICPC ranking, finalised once, rating and fame awarded', async () => {
  const start = Date.parse(contests.find((c) => c.slug === 't-ended')!.startsAt)
  const at = (min: number) => new Date(start + min * 60_000)
  const fast = await makeUser('Fast')
  const slow = await makeUser('Slow')
  const one = await makeUser('One')
  const rows = [
    [fast, 'star-rating', true, 5],
    [fast, 'accordion', true, 20],
    [slow, 'star-rating', false, 3],
    [slow, 'star-rating', true, 10],
    [slow, 'accordion', true, 30],
    [one, 'accordion', true, 50],
  ] as const
  for (const [userId, problem, accepted, min] of rows)
    await db.insert(contestSubmissions).values({
      userId,
      contest: 't-ended',
      problem,
      accepted,
      passed: accepted ? 3 : 1,
      total: 3,
      createdAt: at(min),
    })
  const before = await Promise.all([fast, slow, one].map(stats))
  // Concurrent first reads must finalise exactly once.
  const [d] = await Promise.all(
    Array.from({ length: 4 }, () => contestDetail(db, 't-ended', fast)),
  )
  const by = Object.fromEntries(d.standings.map((s) => [s.name, s]))
  assert.deepEqual([by.Fast.rank, by.Slow.rank, by.One.rank], [1, 2, 3])
  assert.equal(by.Fast.penalty, 25)
  assert.equal(by.Slow.penalty, 45)
  // 3 players: rank 1 is the top 33% → ×1; everyone gets plain points.
  assert.equal((by.Fast as { ratingAwarded: number }).ratingAwarded, 50)
  const after = await Promise.all([fast, slow, one].map(stats))
  assert.equal(after[0].rating - (before[0]?.rating ?? 0), 50)
  assert.equal(after[2].rating - (before[2]?.rating ?? 0), 30)
  assert.ok(after.every((s, i) => s.fame - (before[i]?.fame ?? 0) === 30))
  await contestDetail(db, 't-ended', fast)
  assert.equal((await stats(fast)).rating, after[0].rating, 'no double award')
})

await db.delete(user).where(sql`${user.id} like 'test-%'`)
await db.$client.end()
if (failed) {
  console.error(`\n${failed} failed`)
  process.exit(1)
}
console.log('\nAll contest and rating tests passed.')
