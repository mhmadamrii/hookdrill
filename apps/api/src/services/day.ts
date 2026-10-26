// Every "day" (check-in, daily problem, streak) is a UTC date, the same for
// everyone. Dates are `YYYY-MM-DD` strings, matching Postgres `date` columns.

export function utcDay(at = new Date()) {
  return at.toISOString().slice(0, 10)
}

export function addDays(day: string, n: number) {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return utcDay(d)
}

export function monthStart(day: string) {
  return `${day.slice(0, 7)}-01`
}
