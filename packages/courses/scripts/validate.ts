/**
 * Structural checks on course content, shared by `check` (whole courses) and
 * `check-file` (one file while writing it). Accuracy still needs a human
 * review; these catch the mistakes a reviewer's eye slides past.
 */
import { designFields, standardCriteria } from '../src/design'
import type {
  Block,
  CalibrationSample,
  DesignChallenge,
  Lesson,
  Question,
} from '../src/types'

export const errors: string[] = []
export const fail = (msg: string) => errors.push(msg)

export function report(okMessage: string) {
  if (errors.length) {
    console.error(errors.join('\n'))
    process.exit(1)
  }
  console.log(okMessage)
}

export function checkQuestion(
  q: Question,
  where: string,
  objectives: Set<string>,
) {
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

function checkDiagram(
  block: Extract<Block, { type: 'diagram' }>,
  where: string,
) {
  const ids = new Set<string>()
  const cells = new Set<string>()
  for (const n of block.nodes) {
    if (ids.has(n.id)) fail(`${where} diagram: repeated node ${n.id}`)
    ids.add(n.id)
    if (n.col < 0 || n.col > 4 || n.row < 0 || n.row > 5)
      fail(`${where} diagram: ${n.id} outside the 5×6 grid`)
    const cell = `${n.col},${n.row}`
    if (cells.has(cell)) fail(`${where} diagram: two nodes at ${cell}`)
    cells.add(cell)
    if (n.label.length > 24)
      fail(`${where} diagram: label too long "${n.label}"`)
  }
  for (const e of block.edges) {
    if (!ids.has(e.from) || !ids.has(e.to))
      fail(`${where} diagram: edge ${e.from}→${e.to} names a missing node`)
    if (e.label && e.label.length > 22)
      fail(`${where} diagram: edge label too long "${e.label}"`)
  }
  if (!block.caption.trim()) fail(`${where} diagram: empty caption`)
}

export interface LessonRules {
  quizSize: number
  /** System Design lessons also need a scenario, a summary and a diagram. */
  levels: boolean
}

/** Checks one lesson. Adds its objective ids to `scopeObjectives`. */
export function checkLesson(
  lesson: Lesson,
  where: string,
  rules: LessonRules,
  unique: (id: string, what: string) => void,
  scopeObjectives: Set<string>,
) {
  const objectives = new Set(lesson.objectives.map((o) => o.id))
  lesson.objectives.forEach((o) => {
    unique(o.id, 'objective')
    scopeObjectives.add(o.id)
  })
  if (lesson.questions.length < rules.quizSize)
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
  const blocks = [
    ...lesson.concept.flatMap((s) => s.blocks),
    ...lesson.application.blocks,
  ]
  for (const b of blocks) if (b.type === 'diagram') checkDiagram(b, where)
  if (rules.levels) {
    if (!blocks.some((b) => b.type === 'diagram'))
      fail(`${where}: needs at least one diagram`)
    if (!lesson.scenario) fail(`${where}: needs a practical scenario`)
    else if (lesson.scenario.checklist.length < 3)
      fail(`${where}: scenario checklist needs 3+ points`)
    const n = lesson.takeaways?.length ?? 0
    if (n < 3 || n > 6) fail(`${where}: takeaways need 3-6 points, has ${n}`)
  }
}

/** Checks a design challenge against the standard rubric and the outline. */
export function checkChallenge(
  c: DesignChallenge,
  where: string,
  lessonSlugs: Set<string>,
) {
  const { rubric } = c
  const total = rubric.criteria.reduce((n, k) => n + k.weight, 0)
  if (total !== 100) fail(`${where}: rubric weights sum to ${total}`)
  if (rubric.passMark <= 0 || rubric.passMark > 100)
    fail(`${where}: rubric pass mark ${rubric.passMark}`)
  const ids = rubric.criteria.map((k) => k.id)
  const standard = standardCriteria.map((k) => k.id)
  if (
    ids.length !== standard.length ||
    standard.some((id) => !ids.includes(id))
  )
    fail(`${where}: rubric must score exactly the standard criteria`)
  for (const k of rubric.criteria) {
    if (k.description.trim().length < 40)
      fail(`${where}: ${k.id} description is too thin`)
    if (k.minScore !== undefined && (k.minScore < 0 || k.minScore > 100))
      fail(`${where}: ${k.id} minScore out of range`)
  }
  if (!/^\d+\.\d+$/.test(c.version)) fail(`${where}: version like "1.0"`)
  if (!/^\d+\.\d+$/.test(rubric.version))
    fail(`${where}: rubric version like "1.0"`)
  for (const [k, lessons] of Object.entries(c.remediation)) {
    if (!standard.includes(k as never))
      fail(`${where}: remediation for unknown ${k}`)
    for (const l of lessons ?? [])
      if (!lessonSlugs.has(l)) fail(`${where}: remediation names unknown ${l}`)
  }
  for (const k of standard)
    if (!c.remediation[k]?.length) fail(`${where}: no remediation for ${k}`)
  for (const [list, name] of [
    [c.requirements, 'requirements'],
    [c.scale, 'scale'],
    [c.constraints, 'constraints'],
  ] as const)
    if (list.length < 2) fail(`${where}: needs 2+ ${name}`)
}

export function checkSamples(samples: CalibrationSample[], where: string) {
  const ids = new Set<string>()
  for (const s of samples) {
    if (ids.has(s.id)) fail(`${where}: repeated sample ${s.id}`)
    ids.add(s.id)
    for (const f of designFields)
      if (!s.answers[f.id]?.trim())
        fail(`${where} sample ${s.id}: empty ${f.id}`)
  }
  if (samples.filter((s) => s.expect === 'pass').length < 2)
    fail(`${where}: needs 2+ passing samples with different designs`)
  if (samples.filter((s) => s.expect === 'fail').length < 1)
    fail(`${where}: needs a failing sample`)
}
