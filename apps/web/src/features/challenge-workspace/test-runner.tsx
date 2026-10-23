import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  useTestRunner,
  type RunnerStatus,
  type TestCase,
} from './useTestRunner'

export type RunMode = 'run' | 'submit'

export interface TestRunResult {
  mode: RunMode
  passed: number
  total: number
  /** Wall-clock time from click to the last test. */
  ms: number
}

interface RunnerState {
  status: RunnerStatus
  tests: TestCase[]
  fileError: string | null
  lastRun: TestRunResult | null
  run: (mode: RunMode) => void
}

const RunnerContext = createContext<RunnerState | null>(null)

/** Owns the hidden test bundler so the toolbar and the console share one runner. */
export function TestRunnerProvider({
  onComplete,
  children,
}: {
  onComplete?: (result: TestRunResult) => void
  children: React.ReactNode
}) {
  const runner = useTestRunner()
  const [lastRun, setLastRun] = useState<TestRunResult | null>(null)
  const pending = useRef<{ mode: RunMode; started: number } | null>(null)
  const latest = useRef(onComplete)
  latest.current = onComplete

  useEffect(() => {
    if (runner.status !== 'done' || !pending.current) return
    const { mode, started } = pending.current
    pending.current = null
    // A file error means the suite never ran; that's not a test result.
    if (runner.fileError) return
    const result: TestRunResult = {
      mode,
      passed: runner.tests.filter((t) => t.status === 'pass').length,
      total: runner.tests.length,
      ms: Math.round(performance.now() - started),
    }
    setLastRun(result)
    latest.current?.(result)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.status])

  const run = (mode: RunMode) => {
    pending.current = { mode, started: performance.now() }
    runner.run()
  }

  return (
    <RunnerContext.Provider
      value={{
        status: runner.status,
        tests: runner.tests,
        fileError: runner.fileError,
        lastRun,
        run,
      }}
    >
      {/* Hidden bundler that runs the test files. */}
      <iframe ref={runner.iframe} title="Test runner" className="hidden" />
      {children}
    </RunnerContext.Provider>
  )
}

export function useRunner() {
  const ctx = useContext(RunnerContext)
  if (!ctx) throw new Error('useRunner must be used inside TestRunnerProvider')
  return ctx
}
