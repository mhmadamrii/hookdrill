import type {
  AssessmentRules,
  Course,
  Lesson,
  Module,
  Question,
  Submodule,
} from './types'

export const rules: AssessmentRules = {
  lessonQuizSize: 6,
  examSize: 15,
  passMark: 0.8,
}

/** Assessment ids are what progress is stored under. */
export const lessonQuizId = (lesson: Pick<Lesson, 'slug'>) =>
  `lesson:${lesson.slug}`
export const examId = (sub: Pick<Submodule, 'slug'>) => `exam:${sub.slug}`

export const isPass = (correct: number, total: number) =>
  total > 0 && correct / total >= rules.passMark

/** Questions needed to pass, for copy like "5 of 6 to pass". */
export const passCount = (total: number) => Math.ceil(total * rules.passMark)

/** Modules that have content, in course order. */
export function availableModules(course: Course): Module[] {
  return course.phases.flatMap((p) =>
    p.modules.flatMap((m) => (m.module ? [m.module] : [])),
  )
}

export interface Assessment {
  id: string
  kind: 'lesson' | 'exam'
  title: string
  module: Module
  submodule: Submodule
  lesson?: Lesson
  bank: Question[]
  size: number
}

/** Every assessment in the course, keyed by id. */
export function assessments(course: Course): Map<string, Assessment> {
  const out = new Map<string, Assessment>()
  for (const module of availableModules(course)) {
    for (const submodule of module.submodules) {
      for (const lesson of submodule.lessons) {
        out.set(lessonQuizId(lesson), {
          id: lessonQuizId(lesson),
          kind: 'lesson',
          title: lesson.title,
          module,
          submodule,
          lesson,
          bank: lesson.questions,
          size: Math.min(rules.lessonQuizSize, lesson.questions.length),
        })
      }
      const bank = [
        ...submodule.lessons.flatMap((l) => l.questions),
        ...submodule.examQuestions,
      ]
      out.set(examId(submodule), {
        id: examId(submodule),
        kind: 'exam',
        title: `${submodule.title} exam`,
        module,
        submodule,
        bank,
        size: Math.min(rules.examSize, bank.length),
      })
    }
  }
  return out
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Draws a randomized paper from the bank. Questions are picked round-robin
 * across learning objectives, so a paper never skips an objective while it has
 * room for one question per objective. Option order is shuffled too.
 */
export function drawPaper(
  bank: Question[],
  size: number,
  random: () => number = Math.random,
): Question[] {
  const byObjective = new Map<string, Question[]>()
  for (const q of shuffle(bank, random)) {
    const list = byObjective.get(q.objective) ?? []
    list.push(q)
    byObjective.set(q.objective, list)
  }
  const queues = shuffle([...byObjective.values()], random)
  const picked: Question[] = []
  while (picked.length < size && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const q = queue.shift()
      if (q && picked.length < size) picked.push(q)
    }
  }
  return shuffle(picked, random).map((q) => ({
    ...q,
    options: shuffle(q.options, random),
  }))
}

export type Answers = Record<string, string>

export interface GradeResult {
  correct: number
  total: number
  passed: boolean
}

/**
 * Scores a submitted paper. Returns null when the paper isn't a valid draw from
 * this assessment: wrong size, repeated or foreign questions, missing answers.
 */
export function grade(
  assessment: Assessment,
  answers: Answers,
): GradeResult | null {
  const ids = Object.keys(answers)
  if (ids.length !== assessment.size) return null
  const bank = new Map(assessment.bank.map((q) => [q.id, q]))
  let correct = 0
  for (const id of ids) {
    const q = bank.get(id)
    if (!q || !q.options.some((o) => o.id === answers[id])) return null
    if (q.answer === answers[id]) correct++
  }
  return { correct, total: ids.length, passed: isPass(correct, ids.length) }
}

export type ItemStatus = 'locked' | 'open' | 'passed'

export interface SubmoduleState {
  submodule: Submodule
  unlocked: boolean
  lessons: Array<{ lesson: Lesson; status: ItemStatus }>
  exam: ItemStatus
}

export interface ModuleState {
  module: Module
  submodules: SubmoduleState[]
  passed: number
  total: number
}

/**
 * Applies the progression rules. A submodule opens when the previous one's
 * exam is passed (the first is always open); its lessons are open in any
 * order; its exam opens once every lesson quiz is passed.
 */
export function courseState(
  course: Course,
  passed: ReadonlySet<string>,
): ModuleState[] {
  let previousExamPassed = true
  return availableModules(course).map((module) => {
    const submodules = module.submodules.map((submodule): SubmoduleState => {
      const unlocked = previousExamPassed
      const lessons = submodule.lessons.map((lesson) => ({
        lesson,
        status: (!unlocked
          ? 'locked'
          : passed.has(lessonQuizId(lesson))
            ? 'passed'
            : 'open') as ItemStatus,
      }))
      const examPassed = passed.has(examId(submodule))
      const exam: ItemStatus = examPassed
        ? 'passed'
        : unlocked && lessons.every((l) => l.status === 'passed')
          ? 'open'
          : 'locked'
      previousExamPassed = examPassed
      return { submodule, unlocked, lessons, exam }
    })
    const items = submodules.flatMap((s) => [
      ...s.lessons.map((l) => l.status),
      s.exam,
    ])
    return {
      module,
      submodules,
      passed: items.filter((s) => s === 'passed').length,
      total: items.length,
    }
  })
}

/** The first unfinished step, for "Continue" buttons. */
export function nextStep(
  states: ModuleState[],
):
  | { kind: 'lesson'; lesson: Lesson }
  | { kind: 'exam'; submodule: Submodule }
  | null {
  for (const m of states) {
    for (const s of m.submodules) {
      if (!s.unlocked) return null
      const lesson = s.lessons.find((l) => l.status === 'open')
      if (lesson) return { kind: 'lesson', lesson: lesson.lesson }
      if (s.exam === 'open') return { kind: 'exam', submodule: s.submodule }
    }
  }
  return null
}

/** Finds a lesson and where it sits in the course. */
export function findLesson(course: Course, slug: string) {
  for (const module of availableModules(course)) {
    for (const submodule of module.submodules) {
      const index = submodule.lessons.findIndex((l) => l.slug === slug)
      if (index >= 0)
        return { module, submodule, lesson: submodule.lessons[index], index }
    }
  }
  return null
}

export function findSubmodule(course: Course, slug: string) {
  for (const module of availableModules(course)) {
    const submodule = module.submodules.find((s) => s.slug === slug)
    if (submodule) return { module, submodule }
  }
  return null
}
