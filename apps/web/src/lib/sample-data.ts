// Sample content for surfaces that have no backend yet (contests, rankings,
// other players). Every screen that shows it labels it as sample data.

export interface RatingTier {
  name: string
  min: number
  className: string
}

/** Codeforces-style tiers; colours come from the theme-independent Tailwind palette. */
export const ratingTiers: RatingTier[] = [
  { name: 'Grandmaster', min: 2400, className: 'text-red-500' },
  { name: 'Master', min: 2100, className: 'text-orange-500' },
  { name: 'Candidate Master', min: 1900, className: 'text-violet-500' },
  { name: 'Expert', min: 1600, className: 'text-blue-500' },
  { name: 'Specialist', min: 1400, className: 'text-cyan-500' },
  { name: 'Pupil', min: 1200, className: 'text-green-500' },
  { name: 'Newbie', min: 0, className: 'text-muted-foreground' },
]

export function tierFor(rating: number) {
  return (
    ratingTiers.find((t) => rating >= t.min) ??
    ratingTiers[ratingTiers.length - 1]
  )
}

export interface Player {
  rank: number
  handle: string
  rating: number
  solved: number
  contests: number
  streak: number
}

const handles = [
  'tourist_ui',
  'rin.t',
  'mkovacs',
  'jdlr',
  'hanne',
  'sofia-builds',
  'kwame.o',
  'priya_n',
  'lukas',
  'tomasz',
  'aiko.dev',
  'noor',
  'diego_r',
  'mei-lin',
  'oluwaseun',
  'erik.s',
  'fatima.z',
  'arjun',
  'chloe_k',
  'nikolai',
  'yuki',
  'zainab',
  'mateo',
  'ines.p',
  'kai',
  'amara',
  'leo.v',
  'sven',
  'hana',
  'omar.dev',
]
export const players: Player[] = handles.map((handle, i) => ({
  rank: i + 1,
  handle,
  rating: Math.round(2780 - i * 54 - (i % 3) * 17),
  solved: Math.max(12, 412 - i * 11 - (i % 4) * 5),
  contests: Math.max(3, 64 - i * 2),
  streak: (i * 7 + 13) % 41,
}))

export interface Contest {
  id: string
  name: string
  startsAt: string
  durationMin: number
  problems: number
  participants: number | null
  kind: 'weekly' | 'biweekly' | 'special'
}

export const upcomingContests: Contest[] = [
  {
    id: 'weekly-14',
    name: 'Weekly Drill 14',
    startsAt: '2026-10-25T14:00:00Z',
    durationMin: 90,
    problems: 4,
    participants: null,
    kind: 'weekly',
  },
  {
    id: 'ui-sprint-6',
    name: 'UI Sprint 6: Forms',
    startsAt: '2026-10-31T13:00:00Z',
    durationMin: 120,
    problems: 5,
    participants: null,
    kind: 'biweekly',
  },
]

export const pastContests: Contest[] = [
  {
    id: 'weekly-13',
    name: 'Weekly Drill 13',
    startsAt: '2026-10-18T14:00:00Z',
    durationMin: 90,
    problems: 4,
    participants: 1284,
    kind: 'weekly',
  },
  {
    id: 'ui-sprint-5',
    name: 'UI Sprint 5: Accessibility',
    startsAt: '2026-10-17T13:00:00Z',
    durationMin: 120,
    problems: 5,
    participants: 942,
    kind: 'biweekly',
  },
  {
    id: 'weekly-12',
    name: 'Weekly Drill 12',
    startsAt: '2026-10-11T14:00:00Z',
    durationMin: 90,
    problems: 4,
    participants: 1190,
    kind: 'weekly',
  },
  {
    id: 'hooks-cup',
    name: 'Hooks Cup 2026',
    startsAt: '2026-10-04T12:00:00Z',
    durationMin: 180,
    problems: 6,
    participants: 2311,
    kind: 'special',
  },
  {
    id: 'weekly-11',
    name: 'Weekly Drill 11',
    startsAt: '2026-10-04T14:00:00Z',
    durationMin: 90,
    problems: 4,
    participants: 1052,
    kind: 'weekly',
  },
  {
    id: 'ui-sprint-4',
    name: 'UI Sprint 4: Async UI',
    startsAt: '2026-10-03T13:00:00Z',
    durationMin: 120,
    problems: 5,
    participants: 877,
    kind: 'biweekly',
  },
]

export interface StudyTrack {
  slug: string
  title: string
  blurb: string
  problems: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  track: 'react' | 'dsa'
}

export const studyTracks: StudyTrack[] = [
  {
    slug: 'react-fundamentals',
    title: 'React Fundamentals',
    blurb: 'State, lists and events by hand, no libraries.',
    problems: 12,
    level: 'Beginner',
    track: 'react',
  },
  {
    slug: 'accessible-components',
    title: 'Accessible Components',
    blurb: 'Keyboard support, focus and ARIA that tests can prove.',
    problems: 9,
    level: 'Intermediate',
    track: 'react',
  },
  {
    slug: 'async-ui',
    title: 'Async UI',
    blurb: 'Debounce, cancellation, loading and error states.',
    problems: 8,
    level: 'Intermediate',
    track: 'react',
  },
  {
    slug: 'forms-validation',
    title: 'Forms & Validation',
    blurb: 'Controlled inputs, multi-step flows, error messages.',
    problems: 10,
    level: 'Beginner',
    track: 'react',
  },
  {
    slug: 'interview-75',
    title: 'Interview 75',
    blurb: 'The classic arrays, strings and graphs set.',
    problems: 75,
    level: 'Intermediate',
    track: 'dsa',
  },
  {
    slug: 'dynamic-programming',
    title: 'Dynamic Programming',
    blurb: 'From memoised recursion to tabulation.',
    problems: 24,
    level: 'Advanced',
    track: 'dsa',
  },
]

/** Deterministic sample activity for the heatmap: [ISO date, count]. */
export function sampleActivity(
  days = 365,
  seed = 7,
): Array<{ date: string; count: number }> {
  const out: Array<{ date: string; count: number }> = []
  const today = new Date('2026-10-23T00:00:00Z')
  let x = seed
  for (let i = days - 1; i >= 0; i--) {
    x = (x * 1103515245 + 12345) % 2147483648
    const r = x / 2147483648
    const d = new Date(today.getTime() - i * 86_400_000)
    const weekday = d.getUTCDay()
    const base = weekday === 0 || weekday === 6 ? 0.45 : 0.6
    out.push({
      date: d.toISOString().slice(0, 10),
      count: r < base ? 0 : Math.ceil((r - base) * 12),
    })
  }
  return out
}
