import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Flat bordered surface used across dashboard and profile pages. */
export function Panel({
  title,
  action,
  sample = false,
  className,
  bodyClassName,
  children,
  ...rest
}: {
  title?: ReactNode
  action?: ReactNode
  sample?: boolean
  className?: string
  bodyClassName?: string
  children: ReactNode
} & Omit<React.ComponentProps<'section'>, 'title'>) {
  return (
    <section
      className={cn(
        'min-w-0 rounded-lg border bg-card text-card-foreground',
        className,
      )}
      {...rest}
    >
      {(title || action || sample) && (
        <header className="flex min-h-12 flex-wrap items-center gap-2 px-4 py-2">
          {title && (
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          )}
          {sample && <SampleBadge />}
          {action && (
            <div className="ml-auto flex items-center gap-1">{action}</div>
          )}
        </header>
      )}
      <div
        className={cn(
          'px-4 pb-4',
          !(title || action || sample) && 'pt-4',
          bodyClassName,
        )}
      >
        {children}
      </div>
    </section>
  )
}

export function SampleBadge({
  label = 'Sample data',
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center rounded-full border border-dashed px-2 text-2xs font-medium text-muted-foreground',
        className,
      )}
    >
      {label}
    </span>
  )
}
