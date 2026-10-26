import { listChallenges, type Difficulty } from '@hookdrill/challenges'

export type Track = 'react' | 'dsa'

export interface Problem {
  number: number
  slug: string
  title: string
  difficulty: Difficulty
  tags: string[]
  track: Track
  /** Only real challenges from packages/challenges can be opened. */
  playable: boolean
}

const real: Problem[] = listChallenges().map((c, i) => ({
  number: i + 1,
  slug: c.slug,
  title: c.title,
  difficulty: c.difficulty,
  tags: c.tags,
  track: c.track === 'dsa' ? 'dsa' : 'react',
  playable: true,
}))

// Problems in the pipeline: listed under "Coming soon", never in the problem table.
const sample: Array<[string, Difficulty, string[], Track]> = [
  ['Tabs with Roving Focus', 'medium', ['Accessibility', 'Keyboard'], 'react'],
  ['Debounced Search', 'medium', ['Async', 'Timers'], 'react'],
  ['Sortable Data Table', 'medium', ['Lists', 'Sorting'], 'react'],
  ['Modal Focus Trap', 'hard', ['Accessibility', 'Focus'], 'react'],
  ['Autocomplete Combobox', 'hard', ['Async', 'Accessibility'], 'react'],
  ['Infinite Feed', 'hard', ['Async', 'Pagination'], 'react'],
  ['Multi-step Form', 'medium', ['Forms', 'Validation'], 'react'],
  ['Kanban Board', 'hard', ['Lists', 'Drag and Drop'], 'react'],
  ['Countdown Timer', 'easy', ['Timers', 'Effects'], 'react'],
  ['File Explorer Tree', 'medium', ['Recursion', 'Lists'], 'react'],
  ['Toast Queue', 'medium', ['State', 'Timers'], 'react'],
  ['Virtualized List', 'hard', ['Performance', 'Lists'], 'react'],
  ['Shopping Cart', 'easy', ['State', 'Derived State'], 'react'],
  ['Date Range Picker', 'hard', ['Dates', 'Keyboard'], 'react'],
  ['Two Sum', 'easy', ['Array', 'Hash Table'], 'dsa'],
  ['Valid Parentheses', 'easy', ['String', 'Stack'], 'dsa'],
  ['Group Anagrams', 'medium', ['String', 'Hash Table'], 'dsa'],
  [
    'Longest Substring Without Repeats',
    'medium',
    ['String', 'Sliding Window'],
    'dsa',
  ],
  ['Merge Intervals', 'medium', ['Array', 'Sorting'], 'dsa'],
  ['Number of Islands', 'medium', ['Graph', 'BFS'], 'dsa'],
  ['LRU Cache', 'medium', ['Design', 'Hash Table'], 'dsa'],
  ['Binary Tree Level Order', 'medium', ['Tree', 'BFS'], 'dsa'],
  ['Coin Change', 'medium', ['Dynamic Programming'], 'dsa'],
  ['Trapping Rain Water', 'hard', ['Array', 'Two Pointers'], 'dsa'],
  ['Median of Two Sorted Arrays', 'hard', ['Array', 'Binary Search'], 'dsa'],
  ['Word Ladder', 'hard', ['Graph', 'BFS'], 'dsa'],
]

export const problems: Problem[] = [
  ...real,
  ...sample.map(([title, difficulty, tags, track], i) => ({
    number: real.length + i + 1,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title,
    difficulty,
    tags,
    track,
    playable: false,
  })),
]

export const playableProblems = problems.filter((p) => p.playable)
export const comingSoon = problems.filter((p) => !p.playable)

/** Topic tags with counts, over the problems people can actually open. */
export const topics = Object.entries(
  playableProblems.reduce<Record<string, number>>((acc, p) => {
    for (const t of p.tags) acc[t] = (acc[t] ?? 0) + 1
    return acc
  }, {}),
)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count)

export function findProblem(slug: string) {
  return problems.find((p) => p.slug === slug)
}
