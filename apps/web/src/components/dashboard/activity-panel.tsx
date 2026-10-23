import type { ReactNode } from 'react'
import { Panel } from './panel'
import { RecentHeatmap } from './recent-heatmap'
import { activityDays, plural, relativeTime, resolveRows, summarize, type ProgressRow } from './stats'

/** Heatmap built from the user's own progress rows (one mark per problem per last-touched day). */
export function ActivityPanel({ rows, className }: { rows: ProgressRow[]; className?: string }) {
  const days = activityDays(rows)
  const active = days.filter((d) => d.count > 0).length
  const s = summarize(rows)
  const last = resolveRows(rows)[0]
  return (
    <Panel
      className={className}
      title={
        <>
          {plural(active, 'active day')} <span className="font-normal text-muted-foreground">in the past year</span>
        </>
      }
    >
      <HeatmapLayout
        days={days}
        facts={[
          ['Last active', last ? relativeTime(last.updated) : 'Not yet'],
          ['Current streak', plural(s.streak, 'day')],
        ]}
        note="Each square counts the problems you last worked on that day. A full per-run history arrives with server grading."
      />
    </Panel>
  )
}

/** Heatmap with a fact column beside it on wide panels, below it on narrow ones. */
export function HeatmapLayout({
  days,
  facts,
  note,
}: {
  days: Array<{ date: string; count: number }>
  facts: Array<[string, ReactNode]>
  note?: string
}) {
  return (
    <div className="@container">
      <div className="flex flex-col gap-4 @4xl:flex-row @4xl:items-stretch @4xl:gap-8">
        <RecentHeatmap days={days} />
        <div className="flex flex-1 flex-col justify-between gap-4 text-xs text-muted-foreground @4xl:border-l @4xl:pl-6">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 @4xl:grid-cols-1">
            {facts.map(([term, value]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-foreground tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          {note && <p className="max-w-[60ch] text-pretty">{note}</p>}
          <Legend />
        </div>
      </div>
    </div>
  )
}

export function Legend() {
  return (
    <span className="flex items-center gap-1.5">
      Less
      {['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4'].map((c) => (
        <span key={c} className={`size-[11px] rounded-[2px] ${c}`} />
      ))}
      More
    </span>
  )
}
