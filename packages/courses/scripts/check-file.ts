/**
 * Checks one System Design content file while it's being written, before it
 * is registered in the course:
 *
 *   pnpm --filter @hookdrill/courses check-file src/system-design/lessons/<slug>.ts
 *
 * Lesson files export `lesson`, exam files `examQuestions` (pass the lesson
 * slugs they draw on after the path), challenge files `challenge`, and sample
 * files `samples`.
 */
import { resolve } from 'node:path'
import { systemDesign } from '../src/system-design'
import {
  checkChallenge,
  checkLesson,
  checkQuestion,
  checkSamples,
  fail,
  report,
} from './validate'

const [file, ...examLessons] = process.argv.slice(2)
if (!file) {
  console.error('Usage: check-file <path> [lesson slugs for an exam file]')
  process.exit(1)
}
const mod = await import(resolve(file))
const where = file.replace(/^.*system-design\//, '')
const ids = new Set<string>()
const unique = (id: string, what: string) => {
  if (ids.has(id)) fail(`${where}: duplicate ${what} id ${id}`)
  ids.add(id)
}
const items = systemDesign.levels.flatMap((l) => l.items)
const lessonSlugs = new Set(
  items.filter((i) => i.kind === 'lesson').map((i) => i.slug),
)

if (mod.lesson) {
  const slug = where.replace(/^lessons\/|\.ts$/g, '')
  if (mod.lesson.slug !== slug) fail(`${where}: slug should be ${slug}`)
  if (!lessonSlugs.has(slug)) fail(`${where}: ${slug} isn't in the curriculum`)
  checkLesson(
    mod.lesson,
    where,
    { quizSize: systemDesign.rules.lessonQuizSize, levels: true },
    unique,
    new Set(),
  )
} else if (mod.examQuestions) {
  const objectives = new Set<string>()
  for (const slug of examLessons) {
    const { lesson } = await import(
      resolve(`src/system-design/lessons/${slug}.ts`)
    )
    lesson.objectives.forEach((o: { id: string }) => objectives.add(o.id))
  }
  if (!examLessons.length) fail(`${where}: pass the lesson slugs it covers`)
  for (const q of mod.examQuestions) {
    unique(q.id, 'question')
    checkQuestion(q, where, objectives)
  }
} else if (mod.challenge) {
  checkChallenge(mod.challenge, where, lessonSlugs)
} else if (mod.samples) {
  checkSamples(mod.samples, where)
} else {
  fail(`${where}: exports none of lesson, examQuestions, challenge, samples`)
}

report(`${where}: all checks passed.`)
