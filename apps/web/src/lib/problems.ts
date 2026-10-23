import { listChallenges, type Difficulty } from '@hookdrill/challenges'

export type Track = 'react' | 'dsa'

export interface Problem {
  number: number
  slug: string
  title: string
  difficulty: Difficulty
  /** Synthetic acceptance rate for sample problems; real ones have no data yet. */
  acceptance: number | null
  tags: string[]
  track: Track
  /** Only real challenges from packages/challenges can be opened. */
  playable: boolean
}

const REAL_TAGS: Record<string, string[]> = {
  'todo-list': ['State', 'Lists', 'Forms'],
  'playlist-builder': ['State', 'Lists', 'Reordering'],
}

const real: Problem[] = listChallenges().map((c, i) => ({
  number: i + 1,
  slug: c.slug,
  title: c.title,
  difficulty: c.difficulty,
  acceptance: null,
  tags: REAL_TAGS[c.slug] ?? [],
  track: c.track === 'dsa' ? 'dsa' : 'react',
  playable: true,
}))

// Sample catalogue (labelled as such in the UI) so the product reads at full scale.
const sample: Array<[string, Difficulty, number, string[], Track]> = [
  ['Accordion', 'easy', 71.2, ['Accessibility', 'Keyboard'], 'react'],
  [
    'Tabs with Roving Focus',
    'medium',
    48.9,
    ['Accessibility', 'Keyboard'],
    'react',
  ],
  ['Star Rating', 'easy', 66.4, ['State', 'Events'], 'react'],
  ['Debounced Search', 'medium', 41.7, ['Async', 'Timers'], 'react'],
  ['Sortable Data Table', 'medium', 44.3, ['Lists', 'Sorting'], 'react'],
  ['Modal Focus Trap', 'hard', 29.8, ['Accessibility', 'Focus'], 'react'],
  ['Autocomplete Combobox', 'hard', 24.1, ['Async', 'Accessibility'], 'react'],
  ['Infinite Feed', 'hard', 27.5, ['Async', 'Pagination'], 'react'],
  ['Counter with Undo', 'easy', 74.9, ['State', 'History'], 'react'],
  ['Multi-step Form', 'medium', 39.6, ['Forms', 'Validation'], 'react'],
  [
    'Password Strength Meter',
    'easy',
    68.1,
    ['Forms', 'Derived State'],
    'react',
  ],
  ['Kanban Board', 'hard', 22.7, ['Lists', 'Drag and Drop'], 'react'],
  ['Countdown Timer', 'easy', 63.3, ['Timers', 'Effects'], 'react'],
  ['File Explorer Tree', 'medium', 37.9, ['Recursion', 'Lists'], 'react'],
  ['Toast Queue', 'medium', 45.2, ['State', 'Timers'], 'react'],
  ['Virtualized List', 'hard', 19.4, ['Performance', 'Lists'], 'react'],
  ['Shopping Cart', 'easy', 70.5, ['State', 'Derived State'], 'react'],
  ['Date Range Picker', 'hard', 21.3, ['Dates', 'Keyboard'], 'react'],
  ['Two Sum', 'easy', 55.8, ['Array', 'Hash Table'], 'dsa'],
  ['Valid Parentheses', 'easy', 42.1, ['String', 'Stack'], 'dsa'],
  ['Group Anagrams', 'medium', 69.4, ['String', 'Hash Table'], 'dsa'],
  [
    'Longest Substring Without Repeats',
    'medium',
    36.9,
    ['String', 'Sliding Window'],
    'dsa',
  ],
  ['Merge Intervals', 'medium', 48.6, ['Array', 'Sorting'], 'dsa'],
  ['Number of Islands', 'medium', 61.2, ['Graph', 'BFS'], 'dsa'],
  ['LRU Cache', 'medium', 44.7, ['Design', 'Hash Table'], 'dsa'],
  ['Binary Tree Level Order', 'medium', 67.3, ['Tree', 'BFS'], 'dsa'],
  ['Coin Change', 'medium', 45.9, ['Dynamic Programming'], 'dsa'],
  ['Trapping Rain Water', 'hard', 63.8, ['Array', 'Two Pointers'], 'dsa'],
  [
    'Median of Two Sorted Arrays',
    'hard',
    41.4,
    ['Array', 'Binary Search'],
    'dsa',
  ],
  ['Word Ladder', 'hard', 40.2, ['Graph', 'BFS'], 'dsa'],
]

export const problems: Problem[] = [
  ...real,
  ...sample.map(([title, difficulty, acceptance, tags, track], i) => ({
    number: real.length + i + 1,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title,
    difficulty,
    acceptance,
    tags,
    track,
    playable: false,
  })),
]

export const topics = Object.entries(
  problems.reduce<Record<string, number>>((acc, p) => {
    for (const t of p.tags) acc[t] = (acc[t] ?? 0) + 1
    return acc
  }, {}),
)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count)

export const playableProblems = problems.filter((p) => p.playable)

export function findProblem(slug: string) {
  return problems.find((p) => p.slug === slug)
}
