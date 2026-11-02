import {
  designFields,
  type DesignChallenge,
  type DesignField,
} from '@hookdrill/courses'
import { env } from '../../env'
import {
  criterionFields,
  geminiResponseSchema,
  SYSTEM_INSTRUCTION,
  weightedScore,
} from './evaluation'

/** Something that turns a prompt into a raw JSON reply. */
export interface Evaluator {
  /** Recorded with every run, e.g. "gemini-3.8-flash" or "stub". */
  model: string
  evaluate(input: {
    prompt: string
    challenge: DesignChallenge
    answers: Record<DesignField, string>
  }): Promise<string>
}

export class EvaluatorError extends Error {}

const TIMEOUT_MS = 90_000

/** Gemini over REST. The key never leaves the server. */
export function geminiEvaluator(apiKey: string, model: string): Evaluator {
  return {
    model,
    async evaluate({ prompt }) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0,
              responseMimeType: 'application/json',
              responseSchema: geminiResponseSchema,
            },
          }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        },
      )
      if (!res.ok) {
        // Never echo request details; the body can include the prompt.
        throw new EvaluatorError(`Gemini returned HTTP ${res.status}`)
      }
      const body = (await res.json()) as {
        candidates?: Array<{
          finishReason?: string
          content?: { parts?: Array<{ text?: string }> }
        }>
        promptFeedback?: { blockReason?: string }
      }
      if (body.promptFeedback?.blockReason)
        throw new EvaluatorError(
          `Gemini blocked the prompt: ${body.promptFeedback.blockReason}`,
        )
      const candidate = body.candidates?.[0]
      const text = candidate?.content?.parts?.map((p) => p.text ?? '').join('')
      if (!text)
        throw new EvaluatorError(
          `Gemini returned no text (${candidate?.finishReason ?? 'no candidate'})`,
        )
      return text
    },
  }
}

/**
 * Development stand-in for Gemini: deterministic, offline, and obviously not
 * a real grade. It scores each criterion by how much its fields say, so the
 * whole submit → evaluate → result flow can be exercised without a key.
 */
export const stubEvaluator: Evaluator = {
  model: 'stub',
  async evaluate({ challenge, answers }) {
    const { rubric } = challenge
    const evaluations = rubric.criteria.map((c) => {
      const words = criterionFields[c.id]
        .map((f) => (answers[f] ?? '').trim().split(/\s+/).filter(Boolean))
        .flat().length
      const hasNumbers = criterionFields[c.id].some((f) =>
        /\d/.test(answers[f] ?? ''),
      )
      const score = Math.min(
        95,
        words < 8 ? 10 : 40 + Math.min(45, words / 2) + (hasNumbers ? 10 : 0),
      )
      return {
        criterion: c.id,
        score: Math.round(score),
        weight: c.weight,
        strengths: words >= 30 ? ['Covers this area in some depth.'] : [],
        weaknesses: words < 30 ? ['Says little about this area.'] : [],
        feedback:
          'Practice grade from the offline stub, based only on how much this section says. It is not a real evaluation.',
        suggestions: [
          'Submit again once AI grading is enabled for a real review.',
        ],
      }
    })
    const overall = weightedScore(
      rubric,
      Object.fromEntries(evaluations.map((e) => [e.criterion, e.score])),
    )
    const passed =
      overall >= rubric.passMark &&
      rubric.criteria.every(
        (c) =>
          c.minScore === undefined ||
          evaluations.find((e) => e.criterion === c.id)!.score >= c.minScore,
      )
    return JSON.stringify({
      overall_score: overall,
      passed,
      summary: `Offline stub grade across ${designFields.length} fields. Not a real evaluation.`,
      evaluations,
      recommendations: [],
      critical_issues: [],
      confidence: 0.1,
    })
  },
}

/** The evaluator for this deployment, or null if grading is off. */
export function configuredEvaluator(): Evaluator | null {
  if (env.GEMINI_API_KEY)
    return geminiEvaluator(env.GEMINI_API_KEY, env.GEMINI_MODEL)
  if (env.DESIGN_EVAL_STUB && env.NODE_ENV !== 'production')
    return stubEvaluator
  return null
}
