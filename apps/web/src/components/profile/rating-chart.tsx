import { useEffect, useRef, useState } from 'react'
import { ratingTiers } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

const H = 260
const PAD = { top: 12, right: 12, bottom: 28, left: 44 }

/** Codeforces-style rating line over faint tier bands. */
export function RatingChart({
  history,
  className,
}: {
  history: number[]
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) =>
      setWidth(Math.round(e.contentRect.width)),
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const n = history.length
  const lo = Math.floor((Math.min(...history) - 100) / 100) * 100
  const hi = Math.ceil((Math.max(...history) + 100) / 100) * 100
  const plotW = Math.max(1, width - PAD.left - PAD.right)
  const plotH = H - PAD.top - PAD.bottom
  const x = (i: number) =>
    PAD.left + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW)
  const y = (r: number) => PAD.top + (1 - (r - lo) / (hi - lo)) * plotH

  const bands = ratingTiers
    .map((t, i) => ({
      tier: t,
      from: t.min,
      to: i === 0 ? Infinity : ratingTiers[i - 1].min,
    }))
    .filter((b) => b.to > lo && b.from < hi)
    .map((b) => ({
      ...b,
      y1: y(Math.min(b.to, hi)),
      y2: y(Math.max(b.from, lo)),
    }))

  const step = hi - lo > 1000 ? 400 : 200
  const ticks: number[] = []
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v)
  const xTicks = Array.from(
    new Set([0, Math.round((n - 1) / 3), Math.round(((n - 1) * 2) / 3), n - 1]),
  )

  const path = history
    .map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(r).toFixed(1)}`)
    .join(' ')
  const h = hover ?? n - 1

  return (
    <div ref={ref} className={cn('relative', className)} style={{ height: H }}>
      {width > 0 && (
        <svg
          width={width}
          height={H}
          role="img"
          aria-label={`Rating over ${n} contests, from ${history[0]} to ${history[n - 1]}, peak ${Math.max(...history)}`}
          className="block touch-none select-none"
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const i = Math.round(
              ((e.clientX - rect.left - PAD.left) / plotW) * (n - 1),
            )
            setHover(Math.min(n - 1, Math.max(0, i)))
          }}
          onPointerLeave={() => setHover(null)}
        >
          {bands.map((b) => (
            <rect
              key={b.tier.name}
              x={PAD.left}
              width={plotW}
              y={b.y1}
              height={b.y2 - b.y1}
              fill="currentColor"
              className={cn(
                b.tier.className,
                'opacity-[0.09] dark:opacity-[0.13]',
              )}
            />
          ))}
          {ticks.map((v) => (
            <g key={v} className="text-muted-foreground">
              <line
                x1={PAD.left}
                x2={PAD.left + plotW}
                y1={y(v)}
                y2={y(v)}
                stroke="currentColor"
                strokeOpacity={0.18}
              />
              <text
                x={PAD.left - 8}
                y={y(v)}
                dy="0.32em"
                textAnchor="end"
                fontSize={11}
                fill="currentColor"
                className="tabular-nums"
              >
                {v}
              </text>
            </g>
          ))}
          {xTicks.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={H - 8}
              textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
              fontSize={11}
              fill="currentColor"
              className="text-muted-foreground tabular-nums"
            >
              #{i + 1}
            </text>
          ))}
          <line
            x1={x(h)}
            x2={x(h)}
            y1={PAD.top}
            y2={PAD.top + plotH}
            stroke="currentColor"
            strokeDasharray="3 3"
            className={cn(
              'text-muted-foreground transition-opacity',
              hover == null && 'opacity-0',
            )}
          />
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinejoin="round"
            className="text-brand"
          />
          {history.map((r, i) => (
            <circle
              key={i}
              cx={x(i)}
              cy={y(r)}
              r={i === h ? 4.5 : n > 40 ? 0 : 2.5}
              fill="var(--card)"
              stroke="currentColor"
              strokeWidth={2}
              className="text-brand"
            />
          ))}
        </svg>
      )}
      {width > 0 && hover != null && (
        <div
          className="pointer-events-none absolute rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md"
          style={{
            left: Math.min(Math.max(x(h) - 64, 0), width - 128),
            top: Math.max(0, y(history[h]) - 56),
            width: 128,
          }}
        >
          <p className="text-muted-foreground">Contest #{h + 1}</p>
          <p className="font-semibold tabular-nums">
            {history[h]}
            {h > 0 && (
              <span
                className={cn(
                  'ml-1.5 font-medium',
                  history[h] >= history[h - 1] ? 'text-accepted' : 'text-wrong',
                )}
              >
                {history[h] >= history[h - 1] ? '+' : ''}
                {history[h] - history[h - 1]}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
