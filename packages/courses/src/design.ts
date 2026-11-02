import type { CriterionId, DesignField } from './types'

/** The submission form, in order. Hints are generic; challenges may add more. */
export const designFields: Array<{
  id: DesignField
  label: string
  hint: string
}> = [
  {
    id: 'functional',
    label: 'Functional requirements',
    hint: 'What the system must do. List the core features in scope, and say what you are leaving out.',
  },
  {
    id: 'nonFunctional',
    label: 'Non-functional requirements',
    hint: 'Availability, latency, consistency, durability, security. Put numbers on them where you can.',
  },
  {
    id: 'capacity',
    label: 'Capacity estimation',
    hint: 'Requests per second, storage over time, bandwidth. Show the arithmetic and the assumptions behind it.',
  },
  {
    id: 'api',
    label: 'API design',
    hint: 'The main endpoints or messages: method, path, inputs, outputs and errors.',
  },
  {
    id: 'database',
    label: 'Database selection and reasoning',
    hint: 'Which store(s), the data model and key access patterns, and why this choice fits.',
  },
  {
    id: 'architecture',
    label: 'High-level architecture',
    hint: 'The components and how a request flows through them. Describe it in text; a numbered flow works well.',
  },
  {
    id: 'scalability',
    label: 'Scalability considerations',
    hint: 'How the design grows: caching, partitioning, replication, async work. Where are the bottlenecks?',
  },
  {
    id: 'failures',
    label: 'Failure handling',
    hint: 'What breaks, how you detect it, and what the system does: retries, fallbacks, redundancy.',
  },
  {
    id: 'tradeoffs',
    label: 'Trade-off analysis',
    hint: 'The main decisions, the alternatives you rejected, and what each choice costs.',
  },
]

/** Longest answer accepted per field, in characters. */
export const designFieldMaxLength = 6000

/** Default criteria and weights from the spec. A rubric may override weights. */
export const standardCriteria: Array<{
  id: CriterionId
  title: string
  weight: number
}> = [
  {
    id: 'requirements_understanding',
    title: 'Requirements understanding',
    weight: 15,
  },
  { id: 'capacity_estimation', title: 'Capacity estimation', weight: 10 },
  { id: 'architecture_design', title: 'Architecture design', weight: 25 },
  { id: 'database_design', title: 'Database design', weight: 15 },
  {
    id: 'scalability_reliability',
    title: 'Scalability and reliability',
    weight: 20,
  },
  { id: 'tradeoff_reasoning', title: 'Trade-off reasoning', weight: 15 },
]

/** Overall score needed to pass a design challenge, out of 100. */
export const designPassMark = 75

/** A criterion below this is a weak area, and its lessons are recommended. */
export const weakCriterionScore = 70
