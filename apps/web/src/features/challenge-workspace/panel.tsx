import { cn } from '@/lib/utils'

/** A floating workspace panel (LeetCode-style rounded card on the page ground). */
export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={cn('flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-card', className)}>
      {children}
    </section>
  )
}

/** The panel's tab strip / title bar. */
export function PanelTabs({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex h-10 shrink-0 items-center gap-2 border-b bg-surface-2/60 px-2 text-sm', className)}>
      {children}
    </div>
  )
}
