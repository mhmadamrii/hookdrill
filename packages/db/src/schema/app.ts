import {
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { user } from './auth'

/** Synced from packages/challenges by scripts/sync-challenges.ts. Content stays in git. */
export const challenges = pgTable('challenges', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  track: text('track').notNull(),
  difficulty: text('difficulty').notNull(),
  points: integer('points').notNull(),
  position: integer('position').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

/** The user's latest code for a challenge, keyed by sandbox path. */
export const drafts = pgTable(
  'drafts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    challengeId: text('challenge_id')
      .notNull()
      .references(() => challenges.id, { onDelete: 'cascade' }),
    files: jsonb('files').$type<Record<string, string>>().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.challengeId] })],
)

/**
 * Phase 1 progress from public test runs in the browser. Personal only: these
 * results are client-reported and never count for points or rankings.
 */
export const progress = pgTable(
  'progress',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    challengeId: text('challenge_id')
      .notNull()
      .references(() => challenges.id, { onDelete: 'cascade' }),
    runs: integer('runs').notNull().default(0),
    lastPassed: integer('last_passed').notNull().default(0),
    lastTotal: integer('last_total').notNull().default(0),
    hintsRevealed: integer('hints_revealed').notNull().default(0),
    publicPassedAt: timestamp('public_passed_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.challengeId] })],
)
