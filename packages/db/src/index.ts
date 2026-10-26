import { defineRelations } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import {
  challenges,
  checkins,
  dailyProblems,
  drafts,
  fameEvents,
  progress,
  userStats,
} from './schema/app'
import { authRelations } from './schema/auth'

export * from './schema'

// Better Auth ships its relations as a part, spread after the full definition.
const relations = defineRelations({
  challenges,
  checkins,
  dailyProblems,
  drafts,
  fameEvents,
  progress,
  userStats,
})

export function createDb(url: string) {
  return drizzle(url, { relations: { ...relations, ...authRelations } })
}

export type Db = ReturnType<typeof createDb>
