import type { Difficulty } from '@hookdrill/challenges'
import type { Problem, Track } from '@/lib/problems'
import type { ProblemStatus } from '@/lib/progress'

export type SortKey = 'default' | 'difficulty' | 'acceptance' | 'title'
export type StatusFilter = 'solved' | 'attempted' | 'todo'

/** URL search params for /problems. Every key is optional so plain links stay valid. */
export interface ProblemsSearch {
  q?: string
  tag?: string
  track?: Track
  sort?: SortKey
  diff?: Difficulty[]
  status?: StatusFilter[]
  playable?: boolean
  /** A personal list; only "favorite" exists so far. */
  list?: 'favorite'
}

const SORTS: SortKey[] = ['default', 'difficulty', 'acceptance', 'title']
const DIFFS: Difficulty[] = ['easy', 'medium', 'hard']
const STATUSES: StatusFilter[] = ['solved', 'attempted', 'todo']

function list<T extends string>(raw: unknown, allowed: T[]): T[] | undefined {
  const arr = Array.isArray(raw)
    ? raw
    : typeof raw === 'string'
      ? raw.split(',')
      : []
  const out = arr.filter((v): v is T => allowed.includes(v as T))
  return out.length ? out : undefined
}

export function validateProblemsSearch(
  raw: Record<string, unknown>,
): ProblemsSearch {
  return {
    q: typeof raw.q === 'string' && raw.q ? raw.q : undefined,
    tag: typeof raw.tag === 'string' && raw.tag ? raw.tag : undefined,
    track: raw.track === 'react' || raw.track === 'dsa' ? raw.track : undefined,
    sort:
      SORTS.includes(raw.sort as SortKey) && raw.sort !== 'default'
        ? (raw.sort as SortKey)
        : undefined,
    diff: list(raw.diff, DIFFS),
    status: list(raw.status, STATUSES),
    playable:
      raw.playable === true || raw.playable === 'true' ? true : undefined,
    list: raw.list === 'favorite' ? 'favorite' : undefined,
  }
}

const DIFF_RANK: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 }

export function applyProblemsSearch(
  all: Problem[],
  s: ProblemsSearch,
  statusOf: (slug: string) => ProblemStatus,
  rateOf: (slug: string) => number | null = () => null,
  isFavorite: (slug: string) => boolean = () => false,
): Problem[] {
  const q = s.q?.trim().toLowerCase()
  const out = all.filter((p) => {
    if (q && !`${p.number}. ${p.title}`.toLowerCase().includes(q)) return false
    if (s.tag && !p.tags.includes(s.tag)) return false
    if (s.track && p.track !== s.track) return false
    if (s.diff && !s.diff.includes(p.difficulty)) return false
    if (s.playable && !p.playable) return false
    if (s.list === 'favorite' && !isFavorite(p.slug)) return false
    if (s.status) {
      const st = statusOf(p.slug)
      const key: StatusFilter = st === 'none' ? 'todo' : st
      if (!s.status.includes(key)) return false
    }
    return true
  })
  switch (s.sort) {
    case 'difficulty':
      return out.sort(
        (a, b) =>
          DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty] ||
          a.number - b.number,
      )
    case 'acceptance':
      return out.sort(
        (a, b) =>
          (rateOf(b.slug) ?? -1) - (rateOf(a.slug) ?? -1) ||
          a.number - b.number,
      )
    case 'title':
      return out.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return out
  }
}

export function activeFilterCount(s: ProblemsSearch) {
  return (s.diff?.length ?? 0) + (s.status?.length ?? 0)
}
