/**
 * Integration tests for design submissions against a real, disposable
 * Postgres: drafts, the one final submission, retries, failures that don't
 * consume the attempt, concurrent submits and crash recovery.
 *
 *   DATABASE_URL=postgres://…/hookdrill_test pnpm --filter @hookdrill/api test:design-flow
 *
 * Refuses to run unless the database name ends in "_test".
 */
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { and, eq, sql } from 'drizzle-orm'
import {
  designFields,
  lessonQuizId,
  standardCriteria,
  systemDesign,
  type DesignChallenge,
  type DesignField,
} from '@hookdrill/courses'
import {
  courseResults,
  createDb,
  designEvaluations,
  designSubmissions,
  user,
} from '@hookdrill/db'
import { weightedScore } from '../src/services/design/evaluation'
import {
  stubEvaluator,
  type Evaluator,
} from '../src/services/design/evaluators'

const url = process.env.DATABASE_URL ?? ''
if (!/\/[\w-]+_test(\?|$)/.test(url)) {
  console.error('Refusing to run: DATABASE_URL must point at a *_test database')
  process.exit(1)
}
const db = createDb(url)

// A fixed challenge, so the flow is tested independently of written content.
const SLUG = 'url-shortener'
const challenge: DesignChallenge = {
  version: '1.0',
  brief: 'Design a URL shortener.',
  requirements: ['Shorten links', 'Redirect fast'],
  scale: ['100M redirects/day', '1M new links/day'],
  constraints: ['p99 redirect under 50 ms', '99.9% availability'],
  instructions: 'Explain your design.',
  rubric: {
    version: '1.0',
    passMark: 75,
    criteria: standardCriteria.map((c) => ({
      ...c,
      description: `What a strong answer shows for ${c.title}, in enough words.`,
    })),
  },
  remediation: {
    capacity_estimation: ['caching-fundamentals'],
    architecture_design: ['load-balancing'],
  },
}
systemDesign.content.challenges[SLUG] = async () => challenge
// Import after registering, so the server's course cache sees the fixture.
const { designOverview, getDraft, getSubmission, saveDraft, submitDesign } =
  await import('../src/services/design/submissions')

const answers = Object.fromEntries(
  designFields.map((f) => [
    f.id,
    `A thorough answer for ${f.label}: 1,200 writes/s at peak, replicated store, cache in front, and more detail.`,
  ]),
) as Record<DesignField, string>

/** Replies with fixed criterion scores, counting calls. */
function scoring(scores: Partial<Record<string, number>>) {
  let calls = 0
  const ev: Evaluator & { calls: () => number } = {
    model: 'test-scorer',
    calls: () => calls,
    async evaluate() {
      calls++
      const evaluations = challenge.rubric.criteria.map((c) => ({
        criterion: c.id,
        score: scores[c.id] ?? 85,
        weight: c.weight,
        strengths: ['Specific.'],
        weaknesses: [],
        feedback: 'Good.',
        suggestions: [],
      }))
      const overall = weightedScore(
        challenge.rubric,
        Object.fromEntries(evaluations.map((e) => [e.criterion, e.score])),
      )
      return JSON.stringify({
        overall_score: overall,
        passed: overall >= 75,
        summary: 'Reviewed.',
        evaluations,
        recommendations: ['Discuss cache invalidation.'],
        critical_issues: [],
        confidence: 0.8,
      })
    },
  }
  return ev
}
const garbage: Evaluator = {
  model: 'test-garbage',
  evaluate: async () => 'not json at all',
}
const broken: Evaluator = {
  model: 'test-broken',
  evaluate: async () => {
    throw new Error('Gemini returned HTTP 503')
  },
}

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
async function rejects(p: Promise<unknown>, code: string) {
  await assert.rejects(p, (e: { code?: string }) => {
    assert.equal(e.code, code)
    return true
  })
}

async function makeUser(prereqsPassed = true) {
  const id = `test-${randomUUID()}`
  await db.insert(user).values({
    id,
    name: 'Flow Test',
    email: `${id}@example.test`,
    emailVerified: true,
  })
  if (prereqsPassed) {
    const item = systemDesign.levels
      .flatMap((l) => l.items)
      .find((i) => i.slug === SLUG)!
    await db.insert(courseResults).values(
      item.prerequisites.map((slug) => ({
        userId: id,
        course: 'system-design',
        assessment: lessonQuizId({ slug }),
        attempts: 1,
        bestCorrect: 5,
        total: 5,
        passedAt: new Date(),
      })),
    )
  }
  return id
}
const evalRows = (id: string) =>
  db
    .select()
    .from(designEvaluations)
    .where(eq(designEvaluations.submissionId, id))
const submissionOf = (userId: string) =>
  getSubmission(db, userId, 'system-design', SLUG)

await test('locked challenge refuses drafts and submissions', async () => {
  const u = await makeUser(false)
  await rejects(saveDraft(db, u, 'system-design', SLUG, answers), 'FORBIDDEN')
  await rejects(
    submitDesign(db, u, 'system-design', SLUG, answers, randomUUID(), garbage),
    'FORBIDDEN',
  )
})

await test('drafts save and load, unlimited times', async () => {
  const u = await makeUser()
  await saveDraft(db, u, 'system-design', SLUG, { functional: 'v1' })
  await saveDraft(db, u, 'system-design', SLUG, { functional: 'v2' })
  const d = await getDraft(db, u, 'system-design', SLUG)
  assert.equal(d?.answers.functional, 'v2')
  assert.equal(await submissionOf(u), null)
})

await test('no evaluator configured: refused, nothing stored', async () => {
  const u = await makeUser()
  await rejects(
    submitDesign(db, u, 'system-design', SLUG, answers, randomUUID(), null),
    'PRECONDITION_FAILED',
  )
  assert.equal(await submissionOf(u), null)
})

await test('incomplete answers are refused', async () => {
  const u = await makeUser()
  await rejects(
    submitDesign(
      db,
      u,
      'system-design',
      SLUG,
      { ...answers, tradeoffs: '  ' },
      randomUUID(),
      garbage,
    ),
    'BAD_REQUEST',
  )
})

await test('invalid AI replies: retried, then failed without consuming the attempt', async () => {
  const u = await makeUser()
  const first = await submitDesign(
    db,
    u,
    'system-design',
    SLUG,
    answers,
    randomUUID(),
    garbage,
  )
  await first.evaluation
  const s = await submissionOf(u)
  assert.equal(s?.status, 'failed')
  const runs = await evalRows(first.id)
  assert.equal(runs.length, 3)
  assert.ok(
    runs.every((r) => r.outcome === 'invalid' && r.raw === 'not json at all'),
  )

  // Resubmitting works and reuses the same row.
  const good = scoring({})
  const again = await submitDesign(
    db,
    u,
    'system-design',
    SLUG,
    answers,
    randomUUID(),
    good,
  )
  await again.evaluation
  assert.equal(again.id, first.id)
  const done = await submissionOf(u)
  assert.equal(done?.status, 'evaluated')
  assert.equal(done?.score, 85)
  assert.equal(done?.passed, true)
  assert.equal((await evalRows(first.id)).length, 4)
})

await test('evaluator errors are recorded and release the lock', async () => {
  const u = await makeUser()
  const r = await submitDesign(
    db,
    u,
    'system-design',
    SLUG,
    answers,
    randomUUID(),
    broken,
  )
  await r.evaluation
  const runs = await evalRows(r.id)
  assert.ok(runs.every((x) => x.outcome === 'error' && /503/.test(x.error!)))
  assert.equal((await submissionOf(u))?.status, 'failed')
})

await test('a flaky reply is retried and the valid one is kept', async () => {
  const u = await makeUser()
  const good = scoring({})
  let n = 0
  const flaky: Evaluator = {
    model: 'test-flaky',
    evaluate: async (input) => (n++ === 0 ? '{"oops":' : good.evaluate(input)),
  }
  const r = await submitDesign(
    db,
    u,
    'system-design',
    SLUG,
    answers,
    randomUUID(),
    flaky,
  )
  await r.evaluation
  assert.deepEqual((await evalRows(r.id)).map((x) => x.outcome).sort(), [
    'invalid',
    'valid',
  ])
  assert.equal((await submissionOf(u))?.status, 'evaluated')
})

await test('one final submission: a second submit is refused', async () => {
  const u = await makeUser()
  const r = await submitDesign(
    db,
    u,
    'system-design',
    SLUG,
    answers,
    randomUUID(),
    scoring({}),
  )
  await r.evaluation
  await rejects(
    submitDesign(
      db,
      u,
      'system-design',
      SLUG,
      answers,
      randomUUID(),
      scoring({}),
    ),
    'CONFLICT',
  )
  await rejects(saveDraft(db, u, 'system-design', SLUG, answers), 'FORBIDDEN')
})

await test('same idempotency key returns the same submission, no new run', async () => {
  const u = await makeUser()
  const ev = scoring({})
  const key = randomUUID()
  const a = await submitDesign(db, u, 'system-design', SLUG, answers, key, ev)
  await a.evaluation
  const b = await submitDesign(db, u, 'system-design', SLUG, answers, key, ev)
  await b.evaluation
  assert.equal(a.id, b.id)
  assert.equal(ev.calls(), 1)
})

await test('concurrent submits grade once', async () => {
  const u = await makeUser()
  const ev = scoring({})
  const settled = await Promise.allSettled(
    Array.from({ length: 5 }, () =>
      submitDesign(db, u, 'system-design', SLUG, answers, randomUUID(), ev),
    ),
  )
  const ok = settled.filter((s) => s.status === 'fulfilled')
  const conflicts = settled.filter(
    (s) =>
      s.status === 'rejected' &&
      (s.reason as { code?: string }).code === 'CONFLICT',
  )
  assert.equal(ok.length, 1, `${ok.length} submits went through`)
  assert.equal(conflicts.length, 4)
  await (ok[0] as PromiseFulfilledResult<{ evaluation: Promise<void> }>).value
    .evaluation
  assert.equal(ev.calls(), 1)
  const rows = await db
    .select()
    .from(designSubmissions)
    .where(eq(designSubmissions.userId, u))
  assert.equal(rows.length, 1)
})

await test('a crashed evaluation reads as failed and can be resubmitted', async () => {
  const u = await makeUser()
  const hang: Evaluator = {
    model: 'test-hang',
    evaluate: () => new Promise(() => {}),
  }
  const r = await submitDesign(
    db,
    u,
    'system-design',
    SLUG,
    answers,
    randomUUID(),
    hang,
  )
  void r.evaluation
  assert.equal((await submissionOf(u))?.status, 'evaluating')
  await rejects(
    submitDesign(
      db,
      u,
      'system-design',
      SLUG,
      answers,
      randomUUID(),
      scoring({}),
    ),
    'CONFLICT',
  )
  // Simulate the server dying mid-evaluation 11 minutes ago.
  await db
    .update(designSubmissions)
    .set({ lockedAt: sql`now() - interval '11 minutes'` })
    .where(eq(designSubmissions.id, r.id))
  assert.equal((await submissionOf(u))?.status, 'failed')
  const again = await submitDesign(
    db,
    u,
    'system-design',
    SLUG,
    answers,
    randomUUID(),
    scoring({}),
  )
  await again.evaluation
  assert.equal((await submissionOf(u))?.status, 'evaluated')
})

await test('a pass records course progress; a low score shows weak areas', async () => {
  const u = await makeUser()
  const r = await submitDesign(
    db,
    u,
    'system-design',
    SLUG,
    answers,
    randomUUID(),
    scoring({ capacity_estimation: 40 }),
  )
  await r.evaluation
  const [progress] = await db
    .select()
    .from(courseResults)
    .where(
      and(
        eq(courseResults.userId, u),
        eq(courseResults.assessment, `challenge:${SLUG}`),
      ),
    )
  assert.ok(progress.passedAt, 'challenge marked passed')
  const overview = await designOverview(db, u, 'system-design')
  assert.equal(overview.results.length, 1)
  assert.equal(overview.results[0].title, 'URL Shortener')
  const weak = overview.weakAreas.find(
    (w) => w.criterion === 'capacity_estimation',
  )
  assert.ok(weak, 'capacity is a weak area')
  assert.deepEqual(weak.lessons, ['caching-fundamentals'])
})

await test('a failing grade is final and does not mark progress', async () => {
  const u = await makeUser()
  const r = await submitDesign(
    db,
    u,
    'system-design',
    SLUG,
    answers,
    randomUUID(),
    scoring({ architecture_design: 30, scalability_reliability: 30 }),
  )
  await r.evaluation
  const s = await submissionOf(u)
  assert.equal(s?.status, 'evaluated')
  assert.equal(s?.passed, false)
  const [p] = await db
    .select()
    .from(courseResults)
    .where(
      and(
        eq(courseResults.userId, u),
        eq(courseResults.assessment, `challenge:${SLUG}`),
      ),
    )
  assert.equal(p.passedAt, null)
  await rejects(
    submitDesign(
      db,
      u,
      'system-design',
      SLUG,
      answers,
      randomUUID(),
      scoring({}),
    ),
    'CONFLICT',
  )
})

await test('stub evaluator grades end to end', async () => {
  const u = await makeUser()
  const r = await submitDesign(
    db,
    u,
    'system-design',
    SLUG,
    answers,
    randomUUID(),
    stubEvaluator,
  )
  await r.evaluation
  const s = await submissionOf(u)
  assert.equal(s?.status, 'evaluated')
  assert.equal((await evalRows(r.id))[0].model, 'stub')
})

// Clean up: users cascade to their rows.
await db.delete(user).where(sql`${user.id} like 'test-%'`)
await db.$client.end()

if (failed) {
  console.error(`\n${failed} failed`)
  process.exit(1)
}
console.log('\nAll design flow tests passed.')
