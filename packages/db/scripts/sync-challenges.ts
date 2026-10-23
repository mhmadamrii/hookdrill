// Upserts challenge metadata from packages/challenges into the database.
// Run on every deploy: `pnpm db:sync-challenges`.
import { config } from 'dotenv'
import { catalog } from '@hookdrill/challenges/catalog'
import type { Difficulty } from '@hookdrill/challenges/catalog'
import { sql } from 'drizzle-orm'
import { challenges, createDb } from '../src'

config({ path: '../../.env' })

const POINTS: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 40 }

const db = createDb(process.env.DATABASE_URL!)
const rows = catalog.map((c, i) => ({
  id: c.id,
  slug: c.slug,
  title: c.title,
  track: c.track,
  difficulty: c.difficulty,
  points: POINTS[c.difficulty],
  position: i + 1,
}))

await db
  .insert(challenges)
  .values(rows)
  .onConflictDoUpdate({
    target: challenges.id,
    set: {
      slug: sql`excluded.slug`,
      title: sql`excluded.title`,
      track: sql`excluded.track`,
      difficulty: sql`excluded.difficulty`,
      points: sql`excluded.points`,
      position: sql`excluded.position`,
      updatedAt: sql`now()`,
    },
  })

console.log(`synced ${rows.length} challenges`)
await db.$client.end()
