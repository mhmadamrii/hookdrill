import type { Difficulty } from '@hookdrill/challenges'

const styles: Record<Difficulty, string> = {
  easy: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  hard: 'bg-rose-100 text-rose-800',
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  )
}
