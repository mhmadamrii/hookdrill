import { cn } from '@/lib/utils'

export type BarlineState = 'open' | 'practice' | 'solved'

const labels: Record<BarlineState, string> = {
  open: 'Not played',
  practice: 'In practice',
  solved: 'Solved, verified by server',
}

/**
 * The signature notation (DESIGN.md): a thin bar is not played, a repeat sign
 * is in practice, and the green thin+thick final barline is a server-verified
 * solve. Only a server verdict may render `solved`.
 */
export function Barline({
  state,
  size = 'md',
  tone = 'paper',
  className,
}: {
  state: BarlineState
  size?: 'sm' | 'md'
  tone?: 'paper' | 'cover'
  className?: string
}) {
  const h = size === 'sm' ? 'h-4' : 'h-7'
  const ink =
    tone === 'cover' ? 'bg-on-cover' : state === 'solved' ? 'bg-pass' : 'bg-ink'
  const thick = size === 'sm' ? 'w-1' : 'w-[7px]'
  const dot = size === 'sm' ? 'size-[3px]' : 'size-1.5'

  return (
    <span
      role="img"
      aria-label={labels[state]}
      className={cn('inline-flex items-stretch gap-1', h, className)}
    >
      {state === 'open' && (
        <i
          className={cn(
            'w-0.5',
            tone === 'cover' ? 'bg-cover-line' : 'bg-mute',
          )}
        />
      )}
      {state === 'practice' && (
        <>
          <i className={cn(thick, ink)} />
          <i className={cn('w-0.5', ink)} />
          <span className="flex flex-col justify-center gap-[30%]">
            <u className={cn('block rounded-full', dot, ink)} />
            <u className={cn('block rounded-full', dot, ink)} />
          </span>
        </>
      )}
      {state === 'solved' && (
        <>
          <i className={cn('w-0.5', ink)} />
          <i className={cn(thick, ink)} />
        </>
      )}
    </span>
  )
}
