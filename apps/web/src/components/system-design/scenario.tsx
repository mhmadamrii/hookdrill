import { CheckSquare, Eye, PencilLine } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Scenario } from '@hookdrill/courses'
import { Prose } from '@/components/courses/blocks'
import { Button } from '@/components/ui/button'

const storageKey = (lesson: string) => `hookdrill:scenario:${lesson}`

/**
 * A practical problem the learner works alone, then compares with a model
 * answer and a checklist. Self-check only: nothing is graded or sent. The
 * draft answer is kept in this browser so it survives a reload.
 */
export function ScenarioPractice({
  lessonSlug,
  scenario,
}: {
  lessonSlug: string
  scenario: Scenario
}) {
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [checked, setChecked] = useState<Set<number>>(new Set())

  useEffect(() => {
    try {
      setAnswer(localStorage.getItem(storageKey(lessonSlug)) ?? '')
    } catch {
      // Storage blocked: the answer just isn't remembered.
    }
  }, [lessonSlug])

  const save = (value: string) => {
    setAnswer(value)
    try {
      localStorage.setItem(storageKey(lessonSlug), value)
    } catch {
      // Ignore: see above.
    }
  }

  return (
    <section aria-labelledby="scenario-h" className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <h2
          id="scenario-h"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <PencilLine className="size-4 text-brand" />
          Practical scenario
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Work it through on your own, then compare. This one isn’t graded.
        </p>
      </div>
      <div className="p-4">
        <Prose source={scenario.prompt} />
        <label
          htmlFor={`scenario-${lessonSlug}`}
          className="mt-4 block text-sm font-medium"
        >
          Your answer{' '}
          <span className="font-normal text-muted-foreground">
            (kept in this browser only)
          </span>
        </label>
        <textarea
          id={`scenario-${lessonSlug}`}
          value={answer}
          onChange={(e) => save(e.target.value)}
          rows={6}
          className="mt-2 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
          placeholder="Sketch your approach: components, data, trade-offs."
        />
        {!revealed ? (
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => setRevealed(true)}
          >
            <Eye /> Show the model answer
          </Button>
        ) : (
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
            <div>
              <h3 className="text-sm font-semibold">One good answer</h3>
              <div className="mt-2 text-[15px]">
                <Prose source={scenario.modelAnswer} />
              </div>
            </div>
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <CheckSquare className="size-4 text-muted-foreground" />
                Did your answer cover
              </h3>
              <ul className="mt-2 flex flex-col gap-2 text-sm">
                {scenario.checklist.map((point, i) => (
                  <li key={point}>
                    <label className="flex cursor-pointer items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={checked.has(i)}
                        onChange={() =>
                          setChecked((prev) => {
                            const next = new Set(prev)
                            if (next.has(i)) next.delete(i)
                            else next.add(i)
                            return next
                          })
                        }
                        className="mt-0.5 size-4 shrink-0 accent-primary"
                      />
                      <span>{point}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground tabular-nums">
                {checked.size} of {scenario.checklist.length} covered
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
