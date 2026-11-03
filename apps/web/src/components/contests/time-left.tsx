import { useEffect, useState } from 'react'

const pad = (n: number) => String(n).padStart(2, '0')

/** "2d 04:13:09" until `to`, ticking each second. Empty until mounted. */
export function TimeLeft({
  to,
  className,
}: {
  to: string
  className?: string
}) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  if (now === null) return <span className={className}>–</span>
  const s = Math.max(0, Math.floor((Date.parse(to) - now) / 1000))
  const d = Math.floor(s / 86400)
  const text = `${d ? `${d}d ` : ''}${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
  return (
    <span className={className} role="timer">
      {text}
    </span>
  )
}

export const contestTime = new Intl.DateTimeFormat('en', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export const endOf = (startsAt: string, minutes: number) =>
  new Date(Date.parse(startsAt) + minutes * 60_000).toISOString()
