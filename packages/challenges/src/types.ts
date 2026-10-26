export type Difficulty = 'easy' | 'medium' | 'hard'

/** "react" = build a component, verified in-browser. "dsa" is reserved for later. */
export type Track = 'react' | 'dsa'

/** Map of sandbox path (e.g. "/App.tsx") to file contents. */
export type FileMap = Record<string, string>

export interface ChallengeMeta {
  id: string
  slug: string
  title: string
  difficulty: Difficulty
  track: Track
  summary: string
  /** Topic tags shown in problem lists and filters, e.g. ['State', 'Forms']. */
  tags: string[]
}

export interface Challenge extends ChallengeMeta {
  /** Markdown shown to the user. */
  description: string
  /** Revealed one at a time, in order. */
  hints: string[]
  /** Files the user edits. The first entry is opened in the editor. */
  starterFiles: FileMap
  /** Hidden from the editor, run by "Run tests". */
  testFiles: FileMap
  /** Extra npm dependencies the sandbox needs (test libraries, etc.). */
  dependencies: Record<string, string>
}
