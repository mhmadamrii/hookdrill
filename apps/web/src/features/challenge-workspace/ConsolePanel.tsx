import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Eye,
  Loader2,
  SquareTerminal,
  XCircle,
} from 'lucide-react'
import { TestStrip, type CellState } from '@/components/test-strip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Panel, PanelTabs } from './panel'
import { PreviewPane } from './PreviewPane'
import { useRunner } from './test-runner'
import { useTypeCheck } from './typecheck/TypeCheck'

export type ConsoleTab = 'preview' | 'result'

const trigger =
  'gap-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none'

export function ConsolePanel({
  tab,
  onTabChange,
}: {
  tab: ConsoleTab
  onTabChange: (tab: ConsoleTab) => void
}) {
  return (
    <Panel>
      <Tabs
        value={tab}
        onValueChange={(v) => onTabChange(v as ConsoleTab)}
        className="flex h-full flex-col gap-0"
      >
        <PanelTabs>
          <TabsList className="h-9 bg-transparent p-0">
            <TabsTrigger value="preview" className={trigger}>
              <Eye className="text-accepted" /> Preview
            </TabsTrigger>
            <TabsTrigger value="result" className={trigger}>
              <SquareTerminal className="text-brand" /> Test Result
            </TabsTrigger>
          </TabsList>
        </PanelTabs>
        {/* Keep the preview mounted so its bundler doesn't restart on every tab switch. */}
        <TabsContent
          value="preview"
          forceMount
          className="min-h-0 flex-1 data-[state=inactive]:hidden"
        >
          <PreviewPane />
        </TabsContent>
        <TabsContent value="result" className="min-h-0 flex-1 overflow-auto">
          <TestResult />
        </TabsContent>
      </Tabs>
    </Panel>
  )
}

function TestResult() {
  const { status, tests, fileError, lastRun } = useRunner()
  const { errorCount } = useTypeCheck()
  const [selected, setSelected] = useState(0)
  const firstFail = tests.findIndex((t) => t.status === 'fail')

  useEffect(() => {
    if (status === 'done') setSelected(firstFail === -1 ? 0 : firstFail)
  }, [status, firstFail])

  if (status === 'loading') {
    return (
      <Empty>
        <Loader2 className="size-4 animate-spin" /> Starting the test runner…
      </Empty>
    )
  }
  if (status === 'running') {
    return (
      <div className="p-5">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Running tests…
        </p>
        {tests.length > 0 && (
          <TestStrip
            className="mt-3"
            cells={tests.map(
              (t) => (t.status === 'idle' ? 'running' : t.status) as CellState,
            )}
          />
        )}
      </div>
    )
  }
  if (fileError) {
    return (
      <div className="p-5">
        <p className="text-xl font-semibold text-wrong">Compile Error</p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-wrong/10 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-wrong">
          {fileError}
        </pre>
      </div>
    )
  }
  if (status !== 'done' || !lastRun) {
    return <Empty>Press Run to check your code against the public tests.</Empty>
  }

  const accepted = lastRun.total > 0 && lastRun.passed === lastRun.total
  const { interrupted } = lastRun
  const current = tests[selected]

  return (
    <div className="p-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className={cn(
            'text-xl font-semibold',
            accepted
              ? 'text-accepted'
              : interrupted
                ? 'text-medium'
                : 'text-wrong',
          )}
        >
          {accepted
            ? 'Accepted'
            : interrupted
              ? 'Run interrupted'
              : 'Wrong Answer'}
        </span>
        <span className="text-sm text-muted-foreground tabular-nums">
          {lastRun.passed} / {lastRun.total} testcases passed ·{' '}
          {(lastRun.ms / 1000).toFixed(1)} s
        </span>
      </div>
      {lastRun.mode === 'submit' && (
        <p className="mt-1 text-xs text-muted-foreground">
          Checked in your browser. Hidden server grading for ranked submissions
          is coming.
        </p>
      )}
      {errorCount > 0 && (
        <p className="mt-2 rounded-lg bg-wrong/10 px-3 py-2 text-xs text-wrong">
          Your code has {errorCount} type{' '}
          {errorCount === 1 ? 'error' : 'errors'}. The tests still ran, because
          the sandbox strips types before running, but fix them as you would
          before shipping.
        </p>
      )}
      {interrupted ? (
        <p className="mt-2 rounded-lg bg-medium/10 px-3 py-2 text-xs text-medium">
          This tab went into the background while tests ran, and the browser
          slowed them down until some timed out. That says nothing about your
          code, so this run wasn’t saved. Keep the tab in front and run again.
        </p>
      ) : (
        tests.some((t) => t.error?.includes('Exceeded timeout')) && (
          <p className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted-foreground">
            Some tests timed out. Check for code that never finishes, such as a
            loop or an update that triggers itself. A very busy computer can
            also slow tests down, so run again to be sure.
          </p>
        )
      )}
      <TestStrip
        className="mt-3"
        cells={tests.map((t) => (t.status === 'pass' ? 'pass' : 'fail'))}
      />

      <div
        className="mt-5 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Test cases"
      >
        {tests.map((t, i) => (
          <button
            key={t.name}
            role="tab"
            aria-selected={i === selected}
            onClick={() => setSelected(i)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm transition-colors',
              i === selected
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent/60',
            )}
          >
            <span
              className={cn(
                'size-1.5 rounded-full',
                t.status === 'pass' ? 'bg-accepted' : 'bg-wrong',
              )}
            />
            Case {i + 1}
          </button>
        ))}
      </div>

      {current && (
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Test</p>
            <p className="mt-1 flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-sm">
              {current.status === 'pass' ? (
                <CheckCircle2 className="size-4 shrink-0 text-accepted" />
              ) : (
                <XCircle className="size-4 shrink-0 text-wrong" />
              )}
              {current.name.replace(/^.*? > /, '')}
            </p>
          </div>
          {current.error && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Output
              </p>
              <pre className="mt-1 overflow-x-auto rounded-lg bg-surface-2 px-3 py-2 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {stripAnsi(current.error)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-32 items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
      {children}
    </div>
  )
}

// Jest matcher messages contain terminal colour codes.
function stripAnsi(text: string) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\u001b\[[0-9;]*m/g, '')
}
