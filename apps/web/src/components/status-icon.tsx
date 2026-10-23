import { CheckCircle2, CircleDashed } from 'lucide-react'
import type { ProblemStatus } from '@/lib/progress'
import { cn } from '@/lib/utils'

export function StatusIcon({
  status,
  className,
}: {
  status: ProblemStatus
  className?: string
}) {
  if (status === 'solved')
    return (
      <CheckCircle2
        aria-label="Public tests passed"
        className={cn('size-4 text-accepted', className)}
      />
    )
  if (status === 'attempted')
    return (
      <CircleDashed
        aria-label="Attempted"
        className={cn('size-4 text-medium', className)}
      />
    )
  return <span aria-hidden className={cn('inline-block size-4', className)} />
}
