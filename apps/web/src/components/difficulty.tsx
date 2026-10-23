import type { Difficulty as Level } from '@hookdrill/challenges'
import { cn } from '@/lib/utils'

const text: Record<Level, string> = {
  easy: 'text-easy',
  medium: 'text-medium',
  hard: 'text-hard',
}
const short: Record<Level, string> = {
  easy: 'Easy',
  medium: 'Med.',
  hard: 'Hard',
}
const long: Record<Level, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

/** Coloured difficulty word, as in problem tables. */
export function DifficultyText({
  level,
  short: useShort = false,
  className,
}: {
  level: Level
  short?: boolean
  className?: string
}) {
  return (
    <span className={cn('font-medium', text[level], className)}>
      {useShort ? short[level] : long[level]}
    </span>
  )
}

/** Pill used on problem pages and cards. */
export function DifficultyPill({
  level,
  className,
}: {
  level: Level
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full bg-surface-2 px-2.5 text-xs font-medium',
        text[level],
        className,
      )}
    >
      {long[level]}
    </span>
  )
}
