import type { Contest } from '@/lib/sample-data'

// Dates render in UTC so server and client output match during hydration.
const dateFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})
const timeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export const formatDate = (iso: string) => dateFmt.format(new Date(iso))
export const formatTime = (iso: string) =>
  `${timeFmt.format(new Date(iso))} UTC`

export function formatDuration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

export const kindLabel: Record<Contest['kind'], string> = {
  weekly: 'Weekly',
  biweekly: 'Biweekly',
  special: 'Special',
}

export const numberFmt = new Intl.NumberFormat('en-US')
