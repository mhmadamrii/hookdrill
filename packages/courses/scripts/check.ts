/**
 * Structural checks on every course, with all content loaded. Run before
 * publishing content: `pnpm --filter @hookdrill/courses check`.
 */
import {
  assessments,
  availableModules,
  courses,
  drawPaper,
  hydrateLevelCourse,
  levelLessons,
  type Course,
  type Lesson,
  type LevelCourse,
} from '../src'
import {
  checkChallenge,
  checkLesson,
  checkQuestion,
  fail,
  report,
} from './validate'

/** Prerequisites name real items, never the item itself, and never loop. */
function checkPrerequisites(course: LevelCourse) {
  const items = new Map(
    course.levels.flatMap((l) => l.items).map((i) => [i.slug, i]),
  )
  for (const item of items.values())
    for (const p of item.prerequisites) {
      if (!items.has(p))
        fail(`${course.slug}/${item.slug}: unknown prereq ${p}`)
      if (p === item.slug) fail(`${course.slug}/${item.slug}: requires itself`)
    }
  const state = new Map<string, 'visiting' | 'done'>()
  const visit = (slug: string, path: string[]): void => {
    if (state.get(slug) === 'done') return
    if (state.get(slug) === 'visiting') {
      fail(`${course.slug}: prerequisite cycle ${[...path, slug].join(' → ')}`)
      return
    }
    state.set(slug, 'visiting')
    for (const p of items.get(slug)?.prerequisites ?? [])
      visit(p, [...path, slug])
    state.set(slug, 'done')
  }
  for (const slug of items.keys()) visit(slug, [])

  // Registered content must belong to the curriculum.
  const { lessons, exams, challenges } = course.content
  for (const slug of Object.keys(lessons))
    if (items.get(slug)?.kind !== 'lesson')
      fail(`${course.slug}: content for unknown lesson ${slug}`)
  for (const slug of Object.keys(challenges))
    if (items.get(slug)?.kind !== 'challenge')
      fail(`${course.slug}: content for unknown challenge ${slug}`)
  for (const slug of Object.keys(exams))
    if (!course.levels.some((l) => l.slug === slug))
      fail(`${course.slug}: exam for unknown level ${slug}`)
}

for (const raw of courses) {
  const course: Course =
    raw.format === 'levels' ? await hydrateLevelCourse(raw) : raw
  const ids = new Set<string>()
  const unique = (id: string, what: string) => {
    if (ids.has(id)) fail(`${course.slug}: duplicate ${what} id ${id}`)
    ids.add(id)
  }
  const lessonRules = {
    quizSize: course.rules.lessonQuizSize,
    levels: course.format === 'levels',
  }
  let lessons: Lesson[]

  if (course.format === 'modules') {
    for (const module of availableModules(course)) {
      for (const sub of module.submodules) {
        unique(sub.slug, 'submodule')
        const scope = new Set<string>()
        for (const lesson of sub.lessons) {
          unique(lesson.slug, 'lesson')
          checkLesson(
            lesson,
            `${course.slug}/${lesson.slug}`,
            lessonRules,
            unique,
            scope,
          )
        }
        for (const q of sub.examQuestions) {
          unique(q.id, 'question')
          checkQuestion(q, `${course.slug}/${sub.slug} exam`, scope)
        }
      }
    }
    lessons = availableModules(course).flatMap((m) =>
      m.submodules.flatMap((s) => s.lessons),
    )
  } else {
    checkPrerequisites(course)
    const lessonSlugs = new Set(
      course.levels
        .flatMap((l) => l.items)
        .filter((i) => i.kind === 'lesson')
        .map((i) => i.slug),
    )
    for (const level of course.levels) {
      unique(level.slug, 'level')
      const scope = new Set<string>()
      for (const item of level.items) {
        unique(item.slug, 'item')
        const where = `${course.slug}/${item.slug}`
        if (item.kind === 'lesson' && item.lesson) {
          if (item.lesson.slug !== item.slug) fail(`${where}: slug mismatch`)
          if (item.lesson.title !== item.title)
            fail(`${where}: title differs from the curriculum`)
          checkLesson(item.lesson, where, lessonRules, unique, scope)
        }
        if (item.kind === 'challenge' && item.challenge)
          checkChallenge(item.challenge, where, lessonSlugs)
      }
      for (const q of level.examQuestions ?? []) {
        unique(q.id, 'question')
        checkQuestion(q, `${course.slug}/${level.slug} exam`, scope)
      }
    }
    lessons = course.levels.flatMap(levelLessons)
  }

  // Every draw must cover every objective it has room for.
  for (const a of assessments(course).values()) {
    const objectives = new Set(a.bank.map((q) => q.objective))
    for (let i = 0; i < 200; i++) {
      const paper = drawPaper(a.bank, a.size)
      if (paper.length !== a.size) fail(`${a.id}: drew ${paper.length}`)
      const covered = new Set(paper.map((q) => q.objective))
      if (covered.size < Math.min(objectives.size, a.size)) {
        fail(`${a.id}: a draw skipped an objective`)
        break
      }
    }
  }

  const answers = lessons
    .flatMap((l) => l.questions)
    .reduce<Record<string, number>>((n, q) => {
      n[q.answer] = (n[q.answer] ?? 0) + 1
      return n
    }, {})
  console.log(
    `${course.slug}: ${lessons.length} lessons, answer letters ${JSON.stringify(answers)}`,
  )
}

report('All course content checks passed.')
