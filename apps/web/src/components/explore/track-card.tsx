import { Atom, Binary } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import type { StudyTrack } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

const levelDots: Record<StudyTrack['level'], number> = { Beginner: 1, Intermediate: 2, Advanced: 3 }

export function TrackMeta({ track, className }: { track: StudyTrack; className?: string }) {
  const Icon = track.track === 'react' ? Atom : Binary
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground', className)}>
      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
        <Icon className={cn('size-3.5', track.track === 'react' ? 'text-brand' : 'text-easy')} />
        {track.track === 'react' ? 'React UI' : 'DSA'}
      </span>
      <span className="inline-flex items-center gap-1.5" aria-label={`Level: ${track.level}`}>
        <span className="flex gap-0.5" aria-hidden>
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={cn('h-2.5 w-1 rounded-full', n <= levelDots[track.level] ? 'bg-medium' : 'bg-border')}
            />
          ))}
        </span>
        {track.level}
      </span>
      <span className="tabular-nums">{track.problems} problems</span>
    </div>
  )
}

export function TrackProgress({ value = 0 }: { value?: number }) {
  return (
    <div className="flex items-center gap-3">
      <Progress value={value} aria-label="Track progress" className="h-1.5 flex-1" />
      <span className="text-xs text-muted-foreground tabular-nums">{value}%</span>
    </div>
  )
}
