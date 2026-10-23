import type { Difficulty } from '@hookdrill/challenges'
import { findProblem, problems, type Problem } from '@/lib/problems'
import type { useMyProgress } from '@/lib/progress'

export type ProgressRow = ReturnType<typeof useMyProgress>['rows'][number]

const pad = (n: number) => String(n).padStart(2, '0')

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const isSolved = (r: ProgressRow) => r.publicPassedAt != null

export interface ResolvedRow extends ProgressRow {
  problem: Problem | undefined
  title: string
  updated: Date
}

/** Joins progress with the catalogue, most recently updated first. */
export function resolveRows(rows: ProgressRow[]): ResolvedRow[] {
  return rows
    .map((r) => {
      const problem = findProblem(r.slug)
      return {
        ...r,
        problem,
        title: problem?.title ?? r.slug,
        updated: new Date(r.updatedAt),
      }
    })
    .sort((a, b) => b.updated.getTime() - a.updated.getTime())
}

const levels: Difficulty[] = ['easy', 'medium', 'hard']

export function solvedByDifficulty(rows: ProgressRow[]) {
  const solvedSlugs = new Set(rows.filter(isSolved).map((r) => r.slug))
  return levels.map((level) => {
    const all = problems.filter((p) => p.difficulty === level)
    return {
      level,
      total: all.length,
      solved: all.filter((p) => solvedSlugs.has(p.slug)).length,
    }
  })
}

/** Days with any progress update, counted per problem touched that day. */
export function activityDays(
  rows: ProgressRow[],
  days = 365,
  now = new Date(),
) {
  const counts = new Map<string, number>()
  for (const r of rows) {
    const k = dayKey(new Date(r.updatedAt))
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  const out: Array<{ date: string; count: number }> = []
  for (let i = days - 1; i >= 0; i--) {
    const k = dayKey(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - i),
    )
    out.push({ date: k, count: counts.get(k) ?? 0 })
  }
  return out
}

/** Consecutive active days ending today (or yesterday, if today has no activity yet). */
export function currentStreak(rows: ProgressRow[], now = new Date()) {
  const active = new Set(rows.map((r) => dayKey(new Date(r.updatedAt))))
  const at = (offset: number) =>
    dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset))
  let offset = active.has(at(0)) ? 0 : 1
  let streak = 0
  while (active.has(at(offset))) {
    streak++
    offset++
  }
  return streak
}

export function summarize(rows: ProgressRow[]) {
  return {
    solved: rows.filter(isSolved).length,
    attempted: rows.filter((r) => !isSolved(r)).length,
    runs: rows.reduce((n, r) => n + r.runs, 0),
    hints: rows.reduce((n, r) => n + r.hintsRevealed, 0),
    activeDays: new Set(rows.map((r) => dayKey(new Date(r.updatedAt)))).size,
    streak: currentStreak(rows),
  }
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function relativeTime(date: Date, now = new Date()) {
  const s = Math.round((date.getTime() - now.getTime()) / 1000)
  const abs = Math.abs(s)
  if (abs < 60) return 'just now'
  if (abs < 3600) return rtf.format(Math.round(s / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(s / 3600), 'hour')
  if (abs < 86400 * 30) return rtf.format(Math.round(s / 86400), 'day')
  return date.toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const plural = (n: number, word: string) =>
  `${n} ${word}${n === 1 ? '' : 's'}`
