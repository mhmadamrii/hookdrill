import { Fragment } from 'react'
import { cn } from '@/lib/utils'

/**
 * A tiny JSX highlighter for the static landing mocks. Colours come from theme
 * tokens so the code reads in light and dark without hard-coded values.
 */
const TOKEN =
  /(\/\/.*$)|("[^"]*"|'[^']*'|`[^`]*`)|(<\/?[A-Za-z][\w.]*|\/?>)|\b(import|from|export|default|function|const|let|return|if|else|true|false|null)\b|([A-Za-z-]+)(?==)|([A-Za-z_$][\w$]*)(?=\()/gm

const CLASS = {
  comment: 'text-muted-foreground italic',
  string: 'text-easy',
  tag: 'text-hard',
  keyword: 'text-brand',
  attr: 'text-medium',
  fn: 'text-foreground font-medium',
} as const

function highlight(line: string) {
  const out: React.ReactNode[] = []
  let last = 0
  for (const m of line.matchAll(TOKEN)) {
    const i = m.index ?? 0
    if (i > last) out.push(line.slice(last, i))
    const kind = m[1]
      ? 'comment'
      : m[2]
        ? 'string'
        : m[3]
          ? 'tag'
          : m[4]
            ? 'keyword'
            : m[5]
              ? 'attr'
              : 'fn'
    out.push(
      <span key={i} className={CLASS[kind]}>
        {m[0]}
      </span>,
    )
    last = i + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

export function CodeLines({
  code,
  start = 1,
  activeLine,
  className,
}: {
  code: string
  start?: number
  /** 1-based line (relative to `start`) that shows the caret. */
  activeLine?: number
  className?: string
}) {
  const lines = code.replace(/\n$/, '').split('\n')
  return (
    <pre
      className={cn(
        'overflow-hidden font-mono text-[12px] leading-[1.7] text-muted-foreground',
        className,
      )}
    >
      <code className="grid grid-cols-[auto_minmax(0,1fr)]">
        {lines.map((line, i) => {
          const active = activeLine === i + 1
          return (
            <Fragment key={i}>
              <span
                aria-hidden
                className={cn(
                  'pr-4 pl-3 text-right tabular-nums select-none',
                  active ? 'text-foreground' : 'text-muted-foreground/50',
                )}
              >
                {start + i}
              </span>
              <span
                className={cn(
                  'pr-3 whitespace-pre text-foreground/85',
                  active && 'bg-primary/[0.07]',
                )}
              >
                {highlight(line)}
                {active && (
                  <span
                    aria-hidden
                    className="ml-px inline-block h-[1.15em] w-[2px] translate-y-[0.2em] animate-[caret_1.1s_steps(1)_infinite] bg-brand"
                  />
                )}
              </span>
            </Fragment>
          )
        })}
      </code>
    </pre>
  )
}
