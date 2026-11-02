/**
 * Grades every challenge's calibration samples and checks each verdict
 * matches what the sample expects: both valid designs pass, the weak and the
 * wrong one fail. Run after changing a rubric, the prompt or the model.
 *
 *   GEMINI_API_KEY=… pnpm --filter @hookdrill/api eval:calibrate [slug…]
 *   pnpm --filter @hookdrill/api eval:calibrate --stub   # plumbing only
 */
import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  hydrateLevelCourse,
  systemDesign,
  type CalibrationSample,
} from '@hookdrill/courses'
import { env } from '../src/env'
import {
  buildPrompt,
  validateEvaluation,
} from '../src/services/design/evaluation'
import {
  geminiEvaluator,
  stubEvaluator,
} from '../src/services/design/evaluators'

const args = process.argv.slice(2)
const useStub = args.includes('--stub')
const only = args.filter((a) => !a.startsWith('--'))
const evaluator = useStub
  ? stubEvaluator
  : env.GEMINI_API_KEY
    ? geminiEvaluator(env.GEMINI_API_KEY, env.GEMINI_MODEL)
    : null
if (!evaluator) {
  console.error('Set GEMINI_API_KEY (or pass --stub to test the plumbing).')
  process.exit(1)
}

const dir = resolve(
  import.meta.dirname,
  '../../../packages/courses/src/system-design/challenges',
)
const course = await hydrateLevelCourse(systemDesign)
const items = course.levels.flatMap((l) => l.items)
const files = (await readdir(dir)).filter((f) => f.endsWith('.samples.ts'))

let mismatches = 0
let errors = 0
for (const file of files) {
  const slug = file.replace('.samples.ts', '')
  if (only.length && !only.includes(slug)) continue
  const item = items.find((i) => i.slug === slug)
  if (item?.kind !== 'challenge' || !item.challenge) {
    console.log(`skip ${slug}: challenge not registered`)
    continue
  }
  const { samples } = (await import(resolve(dir, file))) as {
    samples: CalibrationSample[]
  }
  console.log(`\n${item.title} (rubric ${item.challenge.rubric.version}, ${evaluator.model})`)
  for (const s of samples) {
    const raw = await evaluator
      .evaluate({
        prompt: buildPrompt(item.title, item.challenge, s.answers),
        challenge: item.challenge,
        answers: s.answers,
      })
      .catch((e: Error) => e)
    if (raw instanceof Error) {
      errors++
      console.log(`  ERROR ${s.id}: ${raw.message}`)
      continue
    }
    const r = validateEvaluation(raw, item.challenge.rubric, s.answers)
    if (!r.ok) {
      errors++
      console.log(`  INVALID ${s.id}: ${r.error}`)
      continue
    }
    const got = r.result.passed ? 'pass' : 'fail'
    const ok = got === s.expect
    if (!ok) mismatches++
    const criteria = r.result.evaluations
      .map((e) => `${e.criterion.split('_')[0]} ${e.score}`)
      .join(', ')
    console.log(
      `  ${ok ? 'ok  ' : 'MISS'} ${s.id} expected ${s.expect}, got ${got} (${r.result.score}) · ${criteria}`,
    )
  }
}

console.log(
  `\n${mismatches} verdict mismatches, ${errors} invalid or failed replies`,
)
// The stub only checks plumbing; its verdicts aren't meant to match.
process.exit(!useStub && (mismatches || errors) ? 1 : 0)
