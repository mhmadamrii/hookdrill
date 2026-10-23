import { cn } from '@/lib/utils'

export type CellState = 'pass' | 'fail' | 'running' | 'idle'

/**
 * HookDrill's signature: one cell per test, read left to right.
 * Used in the workspace console, the landing hero and recent activity.
 */
export function TestStrip({
  cells,
  size = 'md',
  className,
}: {
  cells: CellState[]
  size?: 'sm' | 'md'
  className?: string
}) {
  const passed = cells.filter((c) => c === 'pass').length
  return (
    <span
      role="img"
      aria-label={`${passed} of ${cells.length} tests passed`}
      className={cn('inline-flex gap-[3px]', className)}
    >
      {cells.map((c, i) => (
        <i
          key={i}
          className={cn(
            'block rounded-[3px]',
            size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5',
            c === 'pass' && 'bg-accepted',
            c === 'fail' && 'bg-wrong',
            c === 'running' && 'animate-pulse bg-primary/60',
            c === 'idle' && 'bg-surface-2 ring-1 ring-border ring-inset',
          )}
        />
      ))}
    </span>
  )
}

/** Build a strip from counts, passes first. */
export function stripFromCounts(passed: number, total: number): CellState[] {
  return Array.from({ length: total }, (_, i) => (i < passed ? 'pass' : 'fail'))
}
