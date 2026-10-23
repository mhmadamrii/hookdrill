import { useEffect, useState } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Code2,
  FileText,
  FlaskConical,
  List,
  Lock,
  Monitor,
  Pencil,
  Play,
  Trash2,
  Upload,
} from 'lucide-react'
import { DifficultyPill } from '@/components/difficulty'
import { LogoMark } from '@/components/logo'
import { TestStrip, type CellState } from '@/components/test-strip'
import { cn } from '@/lib/utils'
import { CodeLines } from './code-lines'

const CODE = `export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  function add(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setTodos([...todos, { id: Date.now(), text }]);
    setText("");
  }

  return (
    <form onSubmit={add}>
      <input data-testid="todo-input" value={text} />
      <button data-testid="add-button">Add</button>
      <ul>
        {todos.map((t) => (
          <li data-testid="todo-item" data-done={t.done}>`

const TESTS = 6

/** Cells fill one by one after mount; reduced motion shows the verdict at once. */
function useRunSequence() {
  const [passed, setPassed] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPassed(TESTS)
      return
    }
    const timers = Array.from({ length: TESTS }, (_, i) =>
      window.setTimeout(() => setPassed(i + 1), 650 + i * 170),
    )
    return () => timers.forEach(clearTimeout)
  }, [])
  return passed
}

function PanelTab({ icon: Icon, label, active }: { icon: typeof Code2; label: string; active?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium',
        active ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      <Icon className={cn('size-3.5', active && 'text-brand')} />
      {label}
    </span>
  )
}

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card', className)}>
      {children}
    </div>
  )
}

function PanelBar({ children }: { children: React.ReactNode }) {
  return <div className="flex h-8 shrink-0 items-center gap-0.5 border-b bg-surface-2/60 px-1.5">{children}</div>
}

const todos = [
  { text: 'Read the spec', done: true },
  { text: 'Wire up add and toggle', done: true },
  { text: 'Edit in place', done: false },
]

function PreviewTodo() {
  return (
    <div className="p-3 text-[12px]">
      <p className="mb-2 text-[13px] font-semibold">Todos</p>
      <div className="flex gap-1.5">
        <span className="flex h-7 min-w-0 flex-1 items-center rounded-md border bg-background px-2 text-muted-foreground">
          What needs doing?
        </span>
        <span className="flex h-7 items-center rounded-md bg-primary px-2.5 font-medium text-primary-foreground">
          Add
        </span>
      </div>
      <ul className="mt-2 divide-y rounded-md border">
        {todos.map((t) => (
          <li key={t.text} className="flex items-center gap-2 px-2 py-1.5">
            <span
              className={cn(
                'grid size-3.5 shrink-0 place-items-center rounded-[4px] border',
                t.done && 'border-accepted bg-accepted text-primary-foreground',
              )}
            >
              {t.done && <Check className="size-2.5" strokeWidth={3.5} />}
            </span>
            <span className={cn('min-w-0 flex-1 truncate', t.done && 'text-muted-foreground line-through')}>
              {t.text}
            </span>
            <Pencil className="size-3 text-muted-foreground" />
            <Trash2 className="size-3 text-muted-foreground" />
          </li>
        ))}
      </ul>
    </div>
  )
}

function Console({ passed }: { passed: number }) {
  const cells: CellState[] = Array.from({ length: TESTS }, (_, i) =>
    i < passed ? 'pass' : i === passed ? 'running' : 'idle',
  )
  const done = passed === TESTS
  const names = [
    'adds a todo with the Add button and with Enter',
    'ignores empty and whitespace-only input',
    'deletes a todo',
    'edits a todo and saves the new text',
  ]
  return (
    <div className="flex flex-1 flex-col gap-2.5 p-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className={cn(
            'text-[15px] font-semibold transition-colors duration-300',
            done ? 'text-accepted' : 'text-muted-foreground',
          )}
          aria-live="polite"
        >
          {done ? 'Accepted' : 'Running tests'}
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {passed} / {TESTS} passed{done && <> · Runtime 412 ms</>}
        </span>
      </div>
      <TestStrip cells={cells} />
      <ul className="space-y-1 text-[11px]">
        {names.map((n, i) => (
          <li key={n} className="flex items-center gap-1.5">
            <CircleCheck
              className={cn(
                'size-3 shrink-0 transition-colors',
                i < passed ? 'text-accepted' : 'text-muted-foreground/40',
              )}
            />
            <span className={cn('truncate', i < passed ? 'text-foreground/80' : 'text-muted-foreground')}>{n}</span>
          </li>
        ))}
        <li className="flex items-center gap-1.5 text-muted-foreground">
          <Lock className="size-3 shrink-0" />
          +2 more · test code stays hidden
        </li>
      </ul>
    </div>
  )
}

/** Static, JSX-built picture of the problem workspace for the hero. */
export function WorkspaceMock({ className }: { className?: string }) {
  const passed = useRunSequence()
  return (
    <div
      role="img"
      aria-label="The HookDrill workspace: the Todo List problem, a code editor with a hand-written React component, a live preview of the todo list, and a test console showing 6 of 6 tests passed, Accepted."
      className={cn('overflow-hidden rounded-xl border bg-background text-left', className)}
    >
      {/* top bar */}
      <div className="flex h-10 items-center gap-2 border-b px-3">
        <LogoMark className="size-5" />
        <span className="ml-1 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <List className="size-3.5" /> Problem List
          <ChevronLeft className="ml-1 size-3.5" />
          <ChevronRight className="size-3.5" />
        </span>
        <div className="mx-auto flex items-center gap-1.5">
          <span className="inline-flex h-6 items-center gap-1 rounded-md bg-secondary px-2.5 text-[11px] font-medium">
            <Play className="size-3" /> Run
          </span>
          <span className="inline-flex h-6 items-center gap-1 rounded-md bg-accepted/15 px-2.5 text-[11px] font-semibold text-accepted">
            <Upload className="size-3" /> Submit
          </span>
        </div>
        <span className="hidden size-5 rounded-full bg-secondary sm:block" />
      </div>

      <div className="grid gap-1.5 p-1.5 md:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
        {/* description */}
        <Panel className="max-md:hidden">
          <PanelBar>
            <PanelTab icon={FileText} label="Description" active />
            <PanelTab icon={FlaskConical} label="Submissions" />
          </PanelBar>
          <div className="space-y-3 p-3">
            <p className="text-[15px] font-semibold tracking-tight">1. Todo List</p>
            <DifficultyPill level="easy" className="h-5 text-[11px]" />
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Build a todo list in <span className="font-mono text-foreground">App.jsx</span>. Add, edit, delete and
              toggle each item.
            </p>
            <div className="rounded-md border text-[11px]">
              <div className="border-b px-2 py-1 font-medium text-muted-foreground">Required test ids</div>
              {['todo-input', 'add-button', 'todo-item', 'toggle-button', 'edit-button', 'delete-button'].map(
                (id) => (
                  <div key={id} className="border-b px-2 py-1 font-mono text-foreground/85 last:border-b-0">
                    {id}
                  </div>
                ),
              )}
            </div>
            <ul className="space-y-1.5 text-[12px] text-muted-foreground">
              {['Empty input adds nothing', 'Toggle sets data-done', 'Edit saves the new text'].map((r) => (
                <li key={r} className="flex items-center gap-1.5">
                  <Check className="size-3 shrink-0 text-brand" />
                  {r}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 rounded-md bg-surface-2/70 px-2 py-1.5 text-[11px] text-muted-foreground">
              <Lock className="size-3" /> 4 hints, revealed one at a time
            </div>
          </div>
        </Panel>

        <div className="grid min-w-0 gap-1.5">
          {/* editor */}
          <Panel>
            <PanelBar>
              <PanelTab icon={Code2} label="Code" active />
              <span className="ml-1 rounded-md bg-card px-2 py-0.5 font-mono text-[11px] text-foreground/85 ring-1 ring-border">
                App.jsx
              </span>
              <span className="ml-auto pr-1 text-[10px] text-muted-foreground">React · JSX</span>
            </PanelBar>
            <CodeLines code={CODE} start={3} activeLine={18} className="py-2" />
          </Panel>

          {/* preview + console */}
          <div className="grid min-w-0 gap-1.5 sm:grid-cols-2">
            <Panel>
              <PanelBar>
                <PanelTab icon={Monitor} label="Preview" active />
              </PanelBar>
              <PreviewTodo />
            </Panel>
            <Panel>
              <PanelBar>
                <PanelTab icon={FlaskConical} label="Test Result" active />
              </PanelBar>
              <Console passed={passed} />
            </Panel>
          </div>
        </div>
      </div>
    </div>
  )
}
