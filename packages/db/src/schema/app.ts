import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
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

/** Running totals per user. Rating stays 0 until server grading ships. */
export const userStats = pgTable(
  'user_stats',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull().default(0),
    fame: integer('fame').notNull().default(0),
    currentStreak: integer('current_streak').notNull().default(0),
    bestStreak: integer('best_streak').notNull().default(0),
    /** UTC date of the latest check-in, `YYYY-MM-DD`. */
    lastCheckinDay: date('last_checkin_day'),
    lastRatingAt: timestamp('last_rating_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index().on(t.fame.desc())],
)

/** One problem per UTC day, the same for everyone. Scheduled, or filled on first request. */
export const dailyProblems = pgTable('daily_problems', {
  day: date('day').primaryKey(),
  challengeId: text('challenge_id')
    .notNull()
    .references(() => challenges.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const checkins = pgTable(
  'checkins',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    day: date('day').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
)

/**
 * Append-only fame ledger; user_stats.fame is its running total. The unique
 * key makes every award idempotent. `ref` names the source (e.g. a contest id).
 */
export const fameEvents = pgTable(
  'fame_events',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    kind: text('kind', {
      enum: ['checkin', 'daily_solve', 'contest'],
    }).notNull(),
    day: date('day').notNull(),
    amount: integer('amount').notNull(),
    ref: text('ref').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.userId, t.kind, t.day, t.ref), index().on(t.day)],
)
