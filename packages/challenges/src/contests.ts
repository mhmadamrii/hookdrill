/**
 * Contests are defined here, in code: add a round with a PR. Problems are
 * existing practice challenges. Grading runs in the browser and is trusted,
 * so results can be gamed (see the README caveat).
 */
export interface ContestProblem {
  /** "A", "B", ... in difficulty order. */
  label: string
  slug: string
  /** Points for solving it; the basis of contest rating. */
  points: number
}

export interface Contest {
  slug: string
  title: string
  /** ISO time, UTC. */
  startsAt: string
  durationMinutes: number
  problems: ContestProblem[]
}

export const contests: Contest[] = [
  {
    slug: 'weekly-drill-1',
    title: 'Weekly Drill 1',
    startsAt: '2026-11-01T13:00:00Z',
    durationMinutes: 90,
    problems: [
      { label: 'A', slug: 'star-rating', points: 20 },
      { label: 'B', slug: 'tabs-with-roving-focus', points: 30 },
      { label: 'C', slug: 'debounced-search', points: 40 },
      { label: 'D', slug: 'kanban-board', points: 60 },
    ],
  },
  {
    slug: 'weekly-drill-2',
    title: 'Weekly Drill 2',
    startsAt: '2026-11-08T13:00:00Z',
    durationMinutes: 90,
    problems: [
      { label: 'A', slug: 'counter-with-undo', points: 20 },
      { label: 'B', slug: 'sortable-data-table', points: 30 },
      { label: 'C', slug: 'autocomplete-combobox', points: 40 },
      { label: 'D', slug: 'virtualized-list', points: 60 },
    ],
  },
]

export type ContestPhase = 'upcoming' | 'live' | 'ended'

export const contestEnd = (c: Contest) =>
  new Date(Date.parse(c.startsAt) + c.durationMinutes * 60_000)

export function contestPhase(c: Contest, now = new Date()): ContestPhase {
  if (now < new Date(c.startsAt)) return 'upcoming'
  return now < contestEnd(c) ? 'live' : 'ended'
}

export const contestBySlug = (slug: string) =>
  contests.find((c) => c.slug === slug)

/** Penalty minutes per rejected submission before an accept (ICPC). */
export const WRONG_PENALTY_MINUTES = 5
/** Fame for taking part in a contest. */
export const CONTEST_FAME = 30

/** Placement multiplier on contest points: top 10% ×1.5, top 25% ×1.25. */
export function placementMultiplier(rank: number, participants: number) {
  const share = rank / participants
  return share <= 0.1 ? 1.5 : share <= 0.25 ? 1.25 : 1
}
