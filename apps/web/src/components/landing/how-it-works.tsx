import { CircleCheck, Lock } from 'lucide-react'
import { TestStrip } from '@/components/test-strip'
import { cn } from '@/lib/utils'
import { CodeLines } from './code-lines'

function SpecVisual() {
  const rows: Array<[string, string]> = [
    ['todo-input', 'text input for a new todo'],
    ['add-button', 'adds the todo'],
    ['todo-item', 'one per todo, with data-done'],
    ['toggle-button', 'marks it done or not done'],
  ]
  return (
    <div className="overflow-hidden rounded-lg border bg-background text-xs">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] border-b bg-surface-2/60 px-3 py-1.5 font-medium text-muted-foreground">
        <span>Test id</span>
        <span>Element</span>
      </div>
      {rows.map(([id, el]) => (
        <div
          key={id}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-2 border-b px-3 py-1.5 last:border-b-0"
        >
          <span className="truncate font-mono text-brand">{id}</span>
          <span className="truncate text-muted-foreground">{el}</span>
        </div>
      ))}
    </div>
  )
}

const BUILD_CODE = `<li data-testid="todo-item" data-done={t.done}>
  <button data-testid="toggle-button"
    onClick={() => toggle(t.id)}>Done</button>`

function BuildVisual() {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <CodeLines
        code={BUILD_CODE}
        start={24}
        activeLine={3}
        className="py-2 text-2xs"
      />
      <div className="flex items-center gap-2 border-t px-3 py-2 text-xs">
        <span className="grid size-3.5 place-items-center rounded-[4px] border border-accepted bg-accepted text-primary-foreground">
          <CircleCheck className="size-2.5" strokeWidth={3} />
        </span>
        <span className="text-muted-foreground line-through">
          Wire up add and toggle
        </span>
        <span className="ml-auto text-2xs text-muted-foreground">
          Live preview
        </span>
      </div>
    </div>
  )
}

function TestsVisual() {
  const tests = [
    'adds a todo with the Add button and with Enter',
    'ignores empty and whitespace-only input',
    'toggles a todo done and undone',
  ]
  return (
    <div className="rounded-lg border bg-background p-3 text-xs">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <span className="font-semibold text-accepted">Accepted</span>
        <TestStrip
          cells={['pass', 'pass', 'pass', 'pass', 'pass', 'pass']}
          size="sm"
        />
      </div>
      <ul className="space-y-1.5">
        {tests.map((t) => (
          <li key={t} className="flex items-center gap-2">
            <CircleCheck className="size-3.5 shrink-0 text-accepted" />
            <span className="truncate">{t}</span>
          </li>
        ))}
        <li className="flex items-center gap-2 text-muted-foreground">
          <Lock className="size-3.5 shrink-0" />
          Test code is never shown
        </li>
      </ul>
    </div>
  )
}

const steps = [
  {
    title: 'Read the spec',
    body: 'Each problem lists its requirements and a data-testid contract. The tests find your elements by those ids, so the markup is yours to design.',
    visual: <SpecVisual />,
  },
  {
    title: 'Build it by hand',
    body: 'Write the component in a real editor with no AI suggestions. The preview re-renders as you type, so you see every state you build.',
    visual: <BuildVisual />,
  },
  {
    title: 'Hidden tests verify',
    body: 'Run the suite in your browser. You see each test by name and its verdict, one cell per test, but never the test code.',
    visual: <TestsVisual />,
  },
]

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-heading"
      className="mx-auto max-w-[1440px] px-4 py-20 md:px-6 md:py-28"
    >
      <div className="max-w-2xl">
        <h2
          id="how-heading"
          className="text-3xl font-semibold tracking-[-0.025em] text-balance md:text-4xl"
        >
          From spec to a green test strip
        </h2>
        <p className="mt-3 text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
          The same loop on every problem. It takes minutes to start and as long
          as it takes to get right.
        </p>
      </div>

      <ol className="relative mt-12 grid gap-10 lg:grid-cols-3 lg:gap-0">
        {/* connecting rail behind the step numbers */}
        <span
          aria-hidden
          className="absolute top-4 right-[16%] left-4 hidden h-px bg-border lg:block"
        />
        {steps.map((s, i) => (
          <li
            key={s.title}
            className={cn(
              'relative flex flex-col gap-5 lg:pr-10',
              i > 0 && 'lg:pl-0',
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'relative grid size-8 place-items-center rounded-full border bg-background text-sm font-semibold tabular-nums',
                  i === 2 &&
                    'border-primary bg-primary text-primary-foreground',
                )}
              >
                {i + 1}
              </span>
              <h3 className="text-lg font-semibold tracking-tight">
                {s.title}
              </h3>
            </div>
            <p className="max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
              {s.body}
            </p>
            <div className="max-w-md">{s.visual}</div>
          </li>
        ))}
      </ol>
    </section>
  )
}
