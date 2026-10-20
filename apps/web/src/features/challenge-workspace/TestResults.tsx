import { useTestRunner } from './useTestRunner'
import type { TestCase } from './useTestRunner'

const icon: Record<TestCase['status'], string> = {
  idle: '○',
  running: '…',
  pass: '✓',
  fail: '✗',
}

export function TestResults() {
  const { iframe, status, tests, fileError, run } = useTestRunner()
  const passed = tests.filter((t) => t.status === 'pass').length

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm">
      {/* Hidden bundler that runs the test files. */}
      <iframe ref={iframe} title="Test runner" className="hidden" />

      <div className="mb-2 flex items-center gap-3">
        <button
          className="rounded bg-zinc-900 px-3 py-1 font-medium text-white disabled:opacity-50"
          disabled={status === 'loading' || status === 'running'}
          onClick={run}
        >
          {status === 'running' ? 'Running…' : 'Run tests'}
        </button>
        <span className="text-zinc-500" data-testid="test-summary">
          {status === 'loading' && 'Starting test runner…'}
          {status === 'ready' && 'Ready.'}
          {status === 'done' &&
            !fileError &&
            `${passed} / ${tests.length} passed`}
          {status === 'done' && fileError && 'Test file failed to run'}
        </span>
      </div>

      {fileError && (
        <pre className="mb-2 overflow-x-auto whitespace-pre-wrap rounded bg-rose-50 p-2 text-xs text-rose-800">
          {fileError}
        </pre>
      )}

      <ul className="space-y-1">
        {tests.map((t) => (
          <li key={t.name} data-testid="test-case" data-status={t.status}>
            <div
              className={
                t.status === 'pass'
                  ? 'text-emerald-700'
                  : t.status === 'fail'
                    ? 'text-rose-700'
                    : 'text-zinc-500'
              }
            >
              <span className="inline-block w-4">{icon[t.status]}</span>
              {t.name}
            </div>
            {t.error && (
              <pre className="ml-4 mt-1 overflow-x-auto whitespace-pre-wrap rounded bg-zinc-50 p-2 text-xs text-zinc-700">
                {stripAnsi(t.error)}
              </pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Jest matcher messages contain terminal colour codes.
function stripAnsi(text: string) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\u001b\[[0-9;]*m/g, '')
}
