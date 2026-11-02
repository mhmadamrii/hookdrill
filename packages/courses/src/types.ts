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
  /** An architecture diagram drawn from data: boxes on a grid, arrows between. */
  | {
      type: 'diagram'
      caption: string
      nodes: DiagramNode[]
      edges: DiagramEdge[]
    }

/** What a box in a diagram stands for; it picks the box's shape. */
export type DiagramNodeKind =
  | 'client'
  | 'service'
  | 'store'
  | 'cache'
  | 'queue'
  | 'external'
  | 'balancer'

export interface DiagramNode {
  id: string
  /** Short: two or three words. */
  label: string
  kind: DiagramNodeKind
  /** Grid position, 0-4 for columns and 0-5 for rows. */
  col: number
  row: number
}

export interface DiagramEdge {
  from: string
  to: string
  /** Short: one to three words. */
  label?: string
  /** Async or optional flow. */
  dashed?: boolean
}

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

/**
 * A practice problem the learner works through on their own, then compares
 * against a model answer and a checklist. Not graded.
 */
export interface Scenario {
  prompt: string
  modelAnswer: string
  /** What a good answer covers, one point per line. */
  checklist: string[]
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
  /** Self-check practice after the knowledge check. */
  scenario?: Scenario
  /** Three to six key takeaways: the lesson summary, shown last. */
  takeaways?: string[]
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

interface CourseBase {
  slug: string
  title: string
  tagline: string
  description: string
  level: string
  status: 'available' | 'coming-soon'
  outcomes: string[]
  prerequisites: string[]
  sources: Reference[]
  rules: AssessmentRules
}

/**
 * Phases of modules, each split into submodules. Progression is linear: a
 * submodule opens when the previous one's exam is passed.
 */
export interface ModuleCourse extends CourseBase {
  format: 'modules'
  phases: Phase[]
}

/**
 * Levels of topics. Progression follows prerequisites: an item opens when
 * every item it depends on is passed, in any order.
 */
export interface LevelCourse extends CourseBase {
  format: 'levels'
  levels: Level[]
  /**
   * Content loaded on demand, so pages that only show the curriculum stay
   * light. An item counts as written once it has a loader here.
   */
  content: CourseContent
}

export type Loader<T> = () => Promise<T>

export interface CourseContent {
  lessons: Record<string, Loader<Lesson>>
  /** Level exam questions, by level slug. */
  exams: Record<string, Loader<Question[]>>
  challenges: Record<string, Loader<DesignChallenge>>
}

export type Course = ModuleCourse | LevelCourse

export interface AssessmentRules {
  lessonQuizSize: number
  examSize: number
  /** Fraction of questions that must be right, e.g. 0.8. */
  passMark: number
}

export interface Level {
  number: number
  slug: string
  title: string
  summary: string
  items: LevelItem[]
  /** The level exam's own questions, attached when loaded. */
  examQuestions?: Question[]
}

interface LevelItemBase {
  /** Unique within the course. */
  slug: string
  title: string
  summary: string
  /** Slugs of items that must be passed first, from any level. */
  prerequisites: string[]
}

/** A concept lesson. `lesson` is attached when the content is loaded. */
export interface LessonItem extends LevelItemBase {
  kind: 'lesson'
  lesson?: Lesson
}

/** A design challenge, graded against a rubric. */
export interface ChallengeItem extends LevelItemBase {
  kind: 'challenge'
  challenge?: DesignChallenge
}

export type LevelItem = LessonItem | ChallengeItem

/** The fields every design submission fills in, in order. */
export type DesignField =
  | 'functional'
  | 'nonFunctional'
  | 'capacity'
  | 'api'
  | 'database'
  | 'architecture'
  | 'scalability'
  | 'failures'
  | 'tradeoffs'

/** The criteria every design rubric scores, with fixed default weights. */
export type CriterionId =
  | 'requirements_understanding'
  | 'capacity_estimation'
  | 'architecture_design'
  | 'database_design'
  | 'scalability_reliability'
  | 'tradeoff_reasoning'

export interface RubricCriterion {
  id: CriterionId
  title: string
  /** Share of the total score; a rubric's weights sum to 100. */
  weight: number
  /** What a strong answer shows. Sent to the evaluator verbatim. */
  description: string
  /** Optional floor: the submission fails if this criterion scores lower. */
  minScore?: number
}

export interface Rubric {
  /** Bumped whenever criteria, weights or descriptions change. */
  version: string
  /** Overall score needed to pass, out of 100. */
  passMark: number
  criteria: RubricCriterion[]
}

/**
 * A real-world design problem. Each version is graded with one rubric, and a
 * learner gets one final submission per version.
 */
export interface DesignChallenge {
  version: string
  brief: string
  requirements: string[]
  scale: string[]
  constraints: string[]
  instructions: string
  rubric: Rubric
  /** Lessons to suggest when a criterion scores low, by criterion id. */
  remediation: Partial<Record<CriterionId, string[]>>
  /** Challenge-specific nudges shown under a field. */
  fieldHints?: Partial<Record<DesignField, string>>
}

/**
 * A hand-written submission with a known verdict, used to check that the
 * evaluator scores different valid designs well and weak ones poorly.
 */
export interface CalibrationSample {
  id: string
  label: string
  expect: 'pass' | 'fail'
  /** Why this verdict is right; for the person reading eval output. */
  note: string
  answers: Record<DesignField, string>
}
