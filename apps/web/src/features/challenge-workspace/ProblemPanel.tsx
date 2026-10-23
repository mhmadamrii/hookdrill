import { useState } from 'react'
import { marked } from 'marked'
import type { Challenge } from '@hookdrill/challenges'
import { DifficultyBadge } from '#/components/ui/DifficultyBadge'

export function ProblemPanel({
  challenge,
  hintsRevealed = 0,
  onHintReveal,
}: {
  challenge: Challenge
  hintsRevealed?: number
  onHintReveal?: (count: number) => void
}) {
  return (
    <section className="min-h-0 overflow-y-auto bg-white p-5 text-sm leading-relaxed">
      <div className="mb-3 flex items-center gap-3">
        <h1 className="text-xl font-bold">{challenge.title}</h1>
        <DifficultyBadge difficulty={challenge.difficulty} />
      </div>
      <div
        className="markdown"
        // Challenge content is authored in-repo, so it is trusted.
        dangerouslySetInnerHTML={{
          __html: marked.parse(challenge.description, { async: false }),
        }}
      />
      <HintList
        hints={challenge.hints}
        initial={hintsRevealed}
        onReveal={onHintReveal}
      />
    </section>
  )
}

function HintList({
  hints,
  initial,
  onReveal,
}: {
  hints: string[]
  initial: number
  onReveal?: (count: number) => void
}) {
  const [revealed, setRevealed] = useState(Math.min(initial, hints.length))

  if (hints.length === 0) return null

  return (
    <div className="mt-6">
      <h2 className="mb-2 text-base font-semibold">Hints</h2>
      <div className="space-y-2">
        {hints.slice(0, revealed).map((hint, i) => (
          <details
            key={i}
            open
            className="rounded border border-zinc-200 bg-zinc-50 px-3 py-2"
          >
            <summary className="cursor-pointer font-medium">
              Hint {i + 1}
            </summary>
            <p
              className="markdown mt-1"
              dangerouslySetInnerHTML={{
                __html: marked.parseInline(hint, { async: false }),
              }}
            />
          </details>
        ))}
      </div>
      {revealed < hints.length && (
        <button
          className="mt-2 rounded border border-zinc-300 px-3 py-1 hover:bg-zinc-100"
          onClick={() => {
            setRevealed(revealed + 1)
            onReveal?.(revealed + 1)
          }}
        >
          Show hint {revealed + 1} of {hints.length}
        </button>
      )}
    </div>
  )
}
