import { Lock } from 'lucide-react'
import { DifficultyText } from '@/components/difficulty'
import { comingSoon } from '@/lib/problems'

/** Problems in the pipeline: titles only, no numbers or stats until they ship. */
export function ComingSoon() {
  if (comingSoon.length === 0) return null
  const tracks = [
    { key: 'react', label: 'React UI' },
    { key: 'dsa', label: 'Data structures & algorithms' },
  ] as const
  return (
    <section aria-labelledby="coming-soon" className="border-t pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="coming-soon" className="text-base font-semibold">
          Coming soon
        </h2>
        <p className="text-sm text-muted-foreground">
          In the pipeline. Each opens once its tests are written.
        </p>
      </div>
      {tracks.map(({ key, label }) => {
        const list = comingSoon.filter((p) => p.track === key)
        if (list.length === 0) return null
        return (
          <div key={key} className="mt-4">
            <h3 className="text-xs font-medium text-muted-foreground">
              {label}
            </h3>
            <ul className="mt-2 grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((p) => (
                <li
                  key={p.slug}
                  className="flex h-9 items-center gap-2.5 border-b text-sm text-muted-foreground"
                >
                  <Lock className="size-3.5 shrink-0" aria-hidden />
                  <span className="flex-1 truncate">{p.title}</span>
                  <DifficultyText
                    level={p.difficulty}
                    short
                    className="text-xs"
                  />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
