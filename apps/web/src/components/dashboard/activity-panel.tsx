import { Heatmap } from '@/components/heatmap'
import { Panel } from './panel'
import { activityDays, plural, type ProgressRow } from './stats'

/** Heatmap built from the user's own progress rows (one mark per problem per last-touched day). */
export function ActivityPanel({ rows, className }: { rows: ProgressRow[]; className?: string }) {
  const days = activityDays(rows)
  const active = days.filter((d) => d.count > 0).length
  return (
    <Panel
      className={className}
      title={
        <>
          {plural(active, 'active day')} <span className="font-normal text-muted-foreground">in the past year</span>
        </>
      }
    >
      <Heatmap days={days} className="pb-1" />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <p className="max-w-[60ch]">
          Each square counts the problems you last worked on that day. A full per-run history arrives with server
          grading.
        </p>
        <Legend />
      </div>
    </Panel>
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
