/**
 * Structural checks on course content. Accuracy still needs a human review;
 * this catches the mistakes a reviewer's eye slides past.
 */
import {
  assessments,
  availableModules,
  courses,
  drawPaper,
  rules,
  type Question,
} from '../src'

const errors: string[] = []
const fail = (msg: string) => errors.push(msg)

function checkQuestion(q: Question, where: string, objectives: Set<string>) {
  if (!objectives.has(q.objective))
    fail(`${where} ${q.id}: unknown objective ${q.objective}`)
  if (q.options.length !== 4) fail(`${where} ${q.id}: needs 4 options`)
  const ids = new Set(q.options.map((o) => o.id))
  if (ids.size !== q.options.length)
    fail(`${where} ${q.id}: repeated option id`)
  if (!ids.has(q.answer)) fail(`${where} ${q.id}: answer ${q.answer} missing`)
  for (const o of q.options) {
    if (!o.text.trim()) fail(`${where} ${q.id}/${o.id}: empty text`)
    if (!o.explanation.trim())
      fail(`${where} ${q.id}/${o.id}: empty explanation`)
    if (/\b(all|none) of the above\b/i.test(o.text))
      fail(`${where} ${q.id}/${o.id}: "all/none of the above"`)
  }
}

for (const course of courses) {
  const ids = new Set<string>()
  const unique = (id: string, what: string) => {
    if (ids.has(id)) fail(`${course.slug}: duplicate ${what} id ${id}`)
    ids.add(id)
  }
  for (const module of availableModules(course)) {
    for (const sub of module.submodules) {
      unique(sub.slug, 'submodule')
      const subObjectives = new Set<string>()
      for (const lesson of sub.lessons) {
        const where = `${course.slug}/${lesson.slug}`
        unique(lesson.slug, 'lesson')
        const objectives = new Set(lesson.objectives.map((o) => o.id))
        lesson.objectives.forEach((o) => {
          unique(o.id, 'objective')
          subObjectives.add(o.id)
        })
        if (lesson.questions.length < rules.lessonQuizSize)
          fail(`${where}: fewer questions than a quiz draws`)
        for (const q of lesson.questions) {
          unique(q.id, 'question')
          checkQuestion(q, where, objectives)
        }
        for (const o of lesson.objectives) {
          const n = lesson.questions.filter((q) => q.objective === o.id).length
          if (n < 2) fail(`${where}: objective ${o.id} has ${n} questions`)
        }
        for (const kind of ['recall', 'concept', 'application'] as const)
          if (!lesson.questions.some((q) => q.kind === kind))
            fail(`${where}: no ${kind} questions`)
        if (!lesson.references.some((r) => r.kind === 'source'))
          fail(`${where}: no source references`)
        if (Number.isNaN(Date.parse(lesson.reviewedAt)))
          fail(`${where}: bad reviewedAt`)
      }
      for (const q of sub.examQuestions) {
        unique(q.id, 'question')
        checkQuestion(q, `${course.slug}/${sub.slug} exam`, subObjectives)
      }
    }
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

  const lessons = availableModules(course).flatMap((m) =>
    m.submodules.flatMap((s) => s.lessons),
  )
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

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log('All course content checks passed.')
