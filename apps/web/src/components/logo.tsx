import { cn } from '@/lib/utils'

/** HookDrill mark: a hook-shaped bracket over a drill bar, drawn as SVG. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn('size-7', className)}>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M11 8v9.5a5 5 0 0 0 10 0V15"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M21 8v3.5"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M8.5 25h15"
        stroke="white"
        strokeOpacity=".55"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight">
        HookDrill
      </span>
    </span>
  )
}
