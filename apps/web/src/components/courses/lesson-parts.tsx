import type { ContentLabel, Lesson } from '@hookdrill/courses'

export const labels: Record<ContentLabel, { name: string; hint: string }> = {
  foundational: {
    name: 'Foundational',
    hint: 'Established knowledge that changes slowly.',
  },
  'current-practice': {
    name: 'Current practice',
    hint: 'How the field works today. Reviewed often, since tools change fast.',
  },
  emerging: {
    name: 'Emerging research',
    hint: 'Active research. Expect this to change.',
  },
}

export const reviewed = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Sources and further reading, grouped. */
export function References({ lesson }: { lesson: Lesson }) {
  const groups = [
    {
      name: 'Sources',
      items: lesson.references.filter((r) => r.kind === 'source'),
    },
    {
      name: 'Further reading',
      items: lesson.references.filter((r) => r.kind === 'further'),
    },
  ].filter((g) => g.items.length > 0)
  return (
    <>
      {groups.map((g) => (
        <div key={g.name} className="mt-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {g.name}
          </h3>
          <ul className="mt-1.5 flex flex-col gap-1.5 text-sm">
            {g.items.map((r) => (
              <li key={r.url}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {r.title}
                </a>
                <span className="text-muted-foreground"> · {r.publisher}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Sources back the facts in this lesson. Sections marked “Teaching
        example” are our own illustrations.
      </p>
    </>
  )
}
