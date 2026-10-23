import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

function useNow(intervalMs = 1000) {
  // null on the server and first client render, so hydration matches.
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(s / 86_400),
    hours: Math.floor((s % 86_400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Large countdown blocks for the hero band (sits on a primary surface). */
export function Countdown({ startsAt }: { startsAt: string }) {
  const now = useNow()
  const target = new Date(startsAt).getTime()

  if (now !== null && target <= now) {
    return (
      <p className="text-2xl font-semibold tracking-tight" role="status">
        Starting soon
      </p>
    )
  }

  const parts = now === null ? null : split(target - now)
  const cells: Array<[string, number | undefined]> = [
    ['days', parts?.days],
    ['hrs', parts?.hours],
    ['min', parts?.minutes],
    ['sec', parts?.seconds],
  ]

  return (
    <div
      className="flex items-start gap-1.5 sm:gap-2"
      role="timer"
      aria-label={parts ? `Starts in ${parts.days} days ${parts.hours} hours ${parts.minutes} minutes` : 'Countdown'}
    >
      {cells.map(([label, value], i) => (
        <div key={label} className="flex items-start gap-1.5 sm:gap-2">
          <div className="flex w-14 flex-col items-center rounded-lg bg-black/20 py-2 sm:w-16">
            <span className="text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
              {value === undefined ? '--' : pad(value)}
            </span>
            <span className="mt-0.5 text-[11px] font-medium text-primary-foreground/75">{label}</span>
          </div>
          {i < cells.length - 1 && (
            <span aria-hidden className="pt-2 text-2xl font-semibold text-primary-foreground/50 sm:text-3xl">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

/** Compact "in 2d 4h" text for secondary cards. */
export function RelativeStart({ startsAt, className }: { startsAt: string; className?: string }) {
  const now = useNow(30_000)
  const target = new Date(startsAt).getTime()
  let text = '…'
  if (now !== null) {
    if (target <= now) text = 'Starting soon'
    else {
      const p = split(target - now)
      text = p.days > 0 ? `Starts in ${p.days}d ${p.hours}h` : `Starts in ${p.hours}h ${p.minutes}m`
    }
  }
  return <span className={cn('tabular-nums', className)}>{text}</span>
}
