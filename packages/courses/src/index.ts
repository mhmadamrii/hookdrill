import { aiEngineer } from './ai-engineer'
import type { Course } from './types'

export type * from './types'
export * from './assessment'
export { aiEngineer }

/** React Mastery is announced but has no syllabus yet. */
export const reactMastery: Course = {
  slug: 'react-mastery',
  title: 'React Mastery',
  tagline: 'Build real interfaces by hand, verified by hidden tests.',
  description:
    'A structured path through state, effects, accessibility, async UI and performance, built on the problem library.',
  level: 'Beginner to advanced',
  status: 'coming-soon',
  outcomes: [],
  prerequisites: [],
  phases: [],
  sources: [],
}

export const courses: Course[] = [aiEngineer, reactMastery]

export const courseBySlug = (slug: string) =>
  courses.find((c) => c.slug === slug)
