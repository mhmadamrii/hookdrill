import { cn } from '@/lib/utils'

const levels = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4']

function level(count: number) {
  if (count <= 0) return 0
  if (count <= 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

/** Year-at-a-glance submission calendar (weeks as columns, Sunday on top). */
export function Heatmap({
  days,
  className,
}: {
  days: Array<{ date: string; count: number }>
  className?: string
}) {
  const first = new Date(days[0]?.date ?? Date.now()).getUTCDay()
  const cells = [...Array<null>(first).fill(null), ...days]
  const weeks: Array<typeof cells> = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  const months: Array<{ index: number; label: string }> = []
  weeks.forEach((w, i) => {
    const d = w.find(Boolean)
    if (!d) return
    const label = new Date(d.date).toLocaleString('en', { month: 'short', timeZone: 'UTC' })
    if (months.at(-1)?.label !== label) months.push({ index: i, label })
  })

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="inline-flex flex-col gap-1.5">
        <div className="relative h-4 text-[11px] text-muted-foreground">
          {months.slice(1).map((m) => (
            <span key={m.index} className="absolute" style={{ left: m.index * 14 }}>
              {m.label}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((w, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {w.map((d, j) =>
                d ? (
                  <span
                    key={j}
                    title={`${d.count} submission${d.count === 1 ? '' : 's'} on ${d.date}`}
                    className={cn('size-[11px] rounded-[2px]', levels[level(d.count)])}
                  />
                ) : (
                  <span key={j} className="size-[11px]" />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
