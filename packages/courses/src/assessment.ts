import type {
  Course,
  Lesson,
  Level,
  LevelItem,
  LevelCourse,
  ModuleCourse,
  Module,
  Question,
  Submodule,
} from './types'

/** Assessment ids are what progress is stored under. */
export const lessonQuizId = (lesson: Pick<Lesson, 'slug'>) =>
  `lesson:${lesson.slug}`
/** A submodule's exam (module courses) or a level's exam (level courses). */
export const examId = (scope: { slug: string }) => `exam:${scope.slug}`
export const challengeId = (item: { slug: string }) => `challenge:${item.slug}`

export const isPass = (correct: number, total: number, passMark: number) =>
  total > 0 && correct / total >= passMark

/** Questions needed to pass, for copy like "5 of 6 to pass". */
export const passCount = (total: number, passMark: number) =>
  Math.ceil(total * passMark)

/** Modules that have content, in course order. */
export function availableModules(course: ModuleCourse): Module[] {
  return course.phases.flatMap((p) =>
    p.modules.flatMap((m) => (m.module ? [m.module] : [])),
  )
}

export interface Assessment {
  id: string
  kind: 'lesson' | 'exam'
  title: string
  lesson?: Lesson
  bank: Question[]
  size: number
  passMark: number
}

/** A lesson's knowledge check, under the course's rules. */
export function lessonAssessment(course: Course, lesson: Lesson): Assessment {
  return {
    id: lessonQuizId(lesson),
    kind: 'lesson',
    title: lesson.title,
    lesson,
    bank: lesson.questions,
    size: Math.min(course.rules.lessonQuizSize, lesson.questions.length),
    passMark: course.rules.passMark,
  }
}

/** A cumulative exam over a submodule or level. */
export function examAssessment(
  course: Course,
  scope: { slug: string; title: string },
  bank: Question[],
): Assessment {
  return {
    id: examId(scope),
    kind: 'exam',
    title: `${scope.title} exam`,
    bank,
    size: Math.min(course.rules.examSize, bank.length),
    passMark: course.rules.passMark,
  }
}

/**
 * Every quiz and exam in the course, keyed by id. Level courses must be
 * hydrated first (`hydrateLevelCourse`); unloaded content is skipped.
 */
export function assessments(course: Course): Map<string, Assessment> {
  const out = new Map<string, Assessment>()
  const addLesson = (lesson: Lesson) =>
    out.set(lessonQuizId(lesson), lessonAssessment(course, lesson))
  const addExam = (scope: { slug: string; title: string }, bank: Question[]) =>
    out.set(examId(scope), examAssessment(course, scope, bank))

  if (course.format === 'modules') {
    for (const module of availableModules(course)) {
      for (const submodule of module.submodules) {
        submodule.lessons.forEach(addLesson)
        addExam(submodule, [
          ...submodule.lessons.flatMap((l) => l.questions),
          ...submodule.examQuestions,
        ])
      }
    }
    return out
  }

  for (const level of course.levels) {
    const lessons = levelLessons(level)
    lessons.forEach(addLesson)
    if (
      level.examQuestions &&
      lessons.length === level.items.filter((i) => i.kind === 'lesson').length
    )
      addExam(level, [
        ...lessons.flatMap((l) => l.questions),
        ...level.examQuestions!,
      ])
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
  return {
    correct,
    total: ids.length,
    passed: isPass(correct, ids.length, assessment.passMark),
  }
}

/** "planned": listed in the curriculum, content not written yet. */
export type ItemStatus = 'planned' | 'locked' | 'open' | 'passed'

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
  course: ModuleCourse,
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
export function findLesson(course: ModuleCourse, slug: string) {
  for (const module of availableModules(course)) {
    for (const submodule of module.submodules) {
      const index = submodule.lessons.findIndex((l) => l.slug === slug)
      if (index >= 0)
        return { module, submodule, lesson: submodule.lessons[index], index }
    }
  }
  return null
}

export function findSubmodule(course: ModuleCourse, slug: string) {
  for (const module of availableModules(course)) {
    const submodule = module.submodules.find((s) => s.slug === slug)
    if (submodule) return { module, submodule }
  }
  return null
}

// ---- Level courses: progression by prerequisites ----

/** The loaded lessons of a level, in order. */
export function levelLessons(level: Level): Lesson[] {
  return level.items.flatMap((i) =>
    i.kind === 'lesson' && i.lesson ? [i.lesson] : [],
  )
}

/** Whether an item's content exists (loaded or registered to load). */
export function isWritten(course: LevelCourse, item: LevelItem) {
  return item.kind === 'lesson'
    ? !!item.lesson || item.slug in course.content.lessons
    : !!item.challenge || item.slug in course.content.challenges
}

/** A level exam exists once its questions and every lesson are written. */
export function levelExamReady(course: LevelCourse, level: Level) {
  return (
    (!!level.examQuestions?.length || level.slug in course.content.exams) &&
    level.items.every((i) => i.kind !== 'lesson' || isWritten(course, i))
  )
}

/** Finds an item anywhere in a level course. */
export function findItem(course: LevelCourse, slug: string) {
  for (const level of course.levels) {
    const item = level.items.find((i) => i.slug === slug)
    if (item) return { level, item }
  }
  return null
}

export async function loadLesson(course: LevelCourse, slug: string) {
  return (await course.content.lessons[slug]?.()) ?? null
}

export async function loadChallenge(course: LevelCourse, slug: string) {
  return (await course.content.challenges[slug]?.()) ?? null
}

/** Loads a level's lessons and exam questions into its exam, or null. */
export async function loadLevelExam(
  course: LevelCourse,
  levelSlug: string,
): Promise<Assessment | null> {
  const level = course.levels.find((l) => l.slug === levelSlug)
  if (!level || !levelExamReady(course, level)) return null
  const lessons = await Promise.all(
    level.items
      .filter((i) => i.kind === 'lesson')
      .map((i) => loadLesson(course, i.slug)),
  )
  const extra = (await course.content.exams[level.slug]?.()) ?? []
  return examAssessment(course, level, [
    ...lessons.flatMap((l) => l?.questions ?? []),
    ...extra,
  ])
}

/** A copy of the course with every piece of content loaded and attached. */
export async function hydrateLevelCourse(
  course: LevelCourse,
): Promise<LevelCourse> {
  const levels = await Promise.all(
    course.levels.map(async (level) => ({
      ...level,
      examQuestions: await course.content.exams[level.slug]?.(),
      items: await Promise.all(
        level.items.map(async (item) =>
          item.kind === 'lesson'
            ? {
                ...item,
                lesson: (await loadLesson(course, item.slug)) ?? undefined,
              }
            : {
                ...item,
                challenge:
                  (await loadChallenge(course, item.slug)) ?? undefined,
              },
        ),
      ),
    })),
  )
  return { ...course, levels }
}

/** The id an item is passed under. */
export const itemId = (item: LevelItem) =>
  item.kind === 'lesson' ? lessonQuizId(item) : challengeId(item)

export interface ItemState {
  item: LevelItem
  status: ItemStatus
  /** Prerequisites not passed yet; empty once the item is unlocked. */
  missing: LevelItem[]
}

export interface LevelState {
  level: Level
  items: ItemState[]
  /** Absent for levels whose final assessment is their challenges. */
  exam?: ItemStatus
  passed: number
  total: number
}

/**
 * Applies the prerequisite rules. An item opens when every prerequisite is
 * passed, whatever its level; a level exam opens when every lesson in the
 * level is passed. Items without written content are "planned".
 */
export function levelState(
  course: LevelCourse,
  passed: ReadonlySet<string>,
): LevelState[] {
  const bySlug = new Map(
    course.levels.flatMap((l) => l.items).map((i) => [i.slug, i]),
  )
  return course.levels.map((level) => {
    const items = level.items.map((item): ItemState => {
      const missing = item.prerequisites
        .map((slug) => bySlug.get(slug)!)
        .filter((p) => !passed.has(itemId(p)))
      const written = isWritten(course, item)
      const status: ItemStatus = passed.has(itemId(item))
        ? 'passed'
        : !written
          ? 'planned'
          : missing.length > 0
            ? 'locked'
            : 'open'
      return { item, status, missing }
    })
    const hasLessons = level.items.some((i) => i.kind === 'lesson')
    const exam: ItemStatus | undefined = !hasLessons
      ? undefined
      : passed.has(examId(level))
        ? 'passed'
        : !levelExamReady(course, level)
          ? 'planned'
          : items.every(
                (i) => i.item.kind !== 'lesson' || i.status === 'passed',
              )
            ? 'open'
            : 'locked'
    const statuses = [...items.map((i) => i.status), ...(exam ? [exam] : [])]
    return {
      level,
      items,
      exam,
      passed: statuses.filter((s) => s === 'passed').length,
      total: statuses.length,
    }
  })
}

/** The first open item, or open level exam, in curriculum order. */
export function nextLevelStep(
  states: LevelState[],
): { kind: 'item'; item: LevelItem } | { kind: 'exam'; level: Level } | null {
  for (const s of states) {
    const open = s.items.find((i) => i.status === 'open')
    if (open) return { kind: 'item', item: open.item }
    if (s.exam === 'open') return { kind: 'exam', level: s.level }
  }
  return null
}

/** Where an assessment stands for this learner, for either course format. */
export function assessmentStatus(
  course: Course,
  passed: ReadonlySet<string>,
  id: string,
): ItemStatus | undefined {
  if (course.format === 'levels') {
    for (const s of levelState(course, passed)) {
      if (id === examId(s.level)) return s.exam
      const item = s.items.find((i) => itemId(i.item) === id)
      if (item) return item.status
    }
    return undefined
  }
  for (const m of courseState(course, passed)) {
    for (const s of m.submodules) {
      if (id === examId(s.submodule)) return s.exam
      const lesson = s.lessons.find((l) => lessonQuizId(l.lesson) === id)
      if (lesson) return lesson.status
    }
  }
  return undefined
}
