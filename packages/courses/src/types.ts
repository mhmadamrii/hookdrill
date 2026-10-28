/**
 * Course content schema. Content is data, written and reviewed by hand, and
 * rendered by the web app. See docs/courses/content-process.md for how each
 * lesson is sourced and verified.
 */

/** How fast a piece of content ages, so reviewers know what to re-check first. */
export type ContentLabel = 'foundational' | 'current-practice' | 'emerging'

/** Named diagrams the web app knows how to draw. */
export type FigureId =
  | 'ai-nesting'
  | 'rules-vs-learning'
  | 'neural-network'
  | 'agent-loop'
  | 'ai-timeline'

export type Block =
  /** Markdown prose. */
  | { type: 'text'; md: string }
  | { type: 'figure'; figure: FigureId; caption: string }
  /** One of our own teaching examples, labelled as such in the UI. */
  | { type: 'example'; title: string; md: string }
  | { type: 'terms'; terms: Array<{ term: string; definition: string }> }
  /** A highlighted aside: a caveat, a rule of thumb, a pointer forward. */
  | { type: 'note'; md: string }

export interface Section {
  heading: string
  blocks: Block[]
}

export interface Objective {
  /** Unique within the course, e.g. "m01-what-is-ai-1". */
  id: string
  /** Completes "By the end, you can ...". */
  text: string
}

export interface Option {
  /** "a", "b", "c", ...; stable, so answers survive shuffling. */
  id: string
  text: string
  /** Why this option is right, or exactly why it is wrong. */
  explanation: string
}

export type QuestionKind = 'recall' | 'concept' | 'application'
export type QuestionDifficulty = 'easy' | 'medium' | 'hard'

export interface Question {
  /** Unique within the course. */
  id: string
  /** The objective this question measures. */
  objective: string
  kind: QuestionKind
  difficulty: QuestionDifficulty
  prompt: string
  options: Option[]
  /** Id of the single best option. */
  answer: string
}

export interface Reference {
  title: string
  publisher: string
  url: string
  /** "source" backs claims in the lesson; "further" is optional reading. */
  kind: 'source' | 'further'
}

export interface Misconception {
  claim: string
  correction: string
}

export interface Lesson {
  slug: string
  title: string
  summary: string
  minutes: number
  label: ContentLabel
  objectives: Objective[]
  /** Intuition first, then precise terms, examples and detail. */
  concept: Section[]
  /** How the idea shows up in a real system, including its limits. */
  application: Section
  misconceptions: Misconception[]
  /** The lesson's question bank. A quiz draws from it. */
  questions: Question[]
  references: Reference[]
  /** ISO date of the last technical review. */
  reviewedAt: string
}

export interface Submodule {
  slug: string
  title: string
  summary: string
  lessons: Lesson[]
  /** Cumulative questions that only appear in the exam. */
  examQuestions: Question[]
}

export interface Module {
  slug: string
  number: number
  title: string
  summary: string
  submodules: Submodule[]
}

/** One row of the course roadmap. Modules with content link to it. */
export interface PlannedModule {
  number: number
  title: string
  topics: string[]
  /** Present once the module's content is written and reviewed. */
  module?: Module
}

export interface Phase {
  number: number
  title: string
  summary: string
  modules: PlannedModule[]
}

export interface Course {
  slug: string
  title: string
  tagline: string
  description: string
  level: string
  status: 'available' | 'coming-soon'
  outcomes: string[]
  prerequisites: string[]
  phases: Phase[]
  sources: Reference[]
}

export interface AssessmentRules {
  lessonQuizSize: number
  examSize: number
  /** Fraction of questions that must be right, e.g. 0.8. */
  passMark: number
}
