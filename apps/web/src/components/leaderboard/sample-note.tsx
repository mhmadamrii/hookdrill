import { FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Marks content that is illustrative, not real platform data. */
export function SampleNote({
  className,
  children = 'Sample data',
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-2xs font-medium text-muted-foreground',
        className,
      )}
    >
      <FlaskConical className="size-3" aria-hidden />
      {children}
    </span>
  )
}

/** ISO country code in a small pill. */
export function CountryPill({ code }: { code: string }) {
  return (
    <span
      title={code}
      className="inline-flex h-5 min-w-8 items-center justify-center rounded border bg-surface-2 px-1.5 text-2xs font-semibold tracking-wide text-muted-foreground"
    >
      {code}
    </span>
  )
}
