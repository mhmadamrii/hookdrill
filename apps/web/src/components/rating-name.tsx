import { tierFor } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

/** Handle coloured by rating tier, Codeforces style. */
export function RatingName({
  handle,
  rating,
  className,
}: {
  handle: string
  rating: number
  className?: string
}) {
  return (
    <span className={cn('font-semibold', tierFor(rating).className, className)}>
      {handle}
    </span>
  )
}
