import { useEffect, useRef, useState } from 'react'
import { useSandpackClient } from '@codesandbox/sandpack-react'

type Listener = Parameters<ReturnType<typeof useSandpackClient>['listen']>[0]
type Message = Parameters<Listener>[0]

export type RunnerStatus = 'loading' | 'ready' | 'running' | 'done'

export interface TestCase {
  /** Describe blocks + test name, e.g. "Todo List > adds a todo". */
  name: string
  status: 'idle' | 'running' | 'pass' | 'fail'
  error?: string
}

/**
 * Drives a dedicated Sandpack bundler iframe in test mode and turns its
 * `test` messages into a flat list of results. This is the same protocol
 * Sandpack's own <SandpackTests> uses, minus its UI.
 */
export function useTestRunner() {
  const { iframe, listen, getClient } = useSandpackClient()
  const [status, setStatus] = useState<RunnerStatus>('loading')
  const [tests, setTests] = useState<TestCase[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  // The first "run-all-tests" only boots Jest inside the bundler. It answers
  // with "initialize_tests" and has to be asked to run again.
  const pendingRun = useRef(false)

  useEffect(() => {
    let blocks: string[] = []

    const upsert = (name: string, patch: Partial<TestCase>) =>
      setTests((prev) => {
        const i = prev.findIndex((t) => t.name === name)
        if (i === -1) return [...prev, { name, status: 'idle', ...patch }]
        const next = [...prev]
        next[i] = { ...next[i], ...patch }
        return next
      })

    return listen((msg: Message) => {
      // The bundler finished compiling: the runner can accept "run".
      if (msg.type === 'done') {
        setStatus((s) => (s === 'loading' ? 'ready' : s))
        return
      }
      if (msg.type !== 'test') return

      switch (msg.event) {
        case 'initialize_tests':
          if (pendingRun.current) {
            getClient()?.dispatch({ type: 'run-all-tests' })
          } else {
            setStatus((s) => (s === 'loading' ? 'ready' : s))
          }
          break
        case 'total_test_start':
          blocks = []
          setStatus('running')
          break
        case 'describe_start':
          blocks.push(msg.blockName)
          break
        case 'describe_end':
          blocks.pop()
          break
        case 'add_test':
          upsert([...blocks, msg.testName].join(' > '), { status: 'idle' })
          break
        case 'test_end': {
          const { test } = msg
          upsert([...test.blocks, test.name].join(' > '), {
            status: test.status,
            error: test.errors.map((e) => e.message).join('\n\n') || undefined,
          })
          break
        }
        case 'file_error':
          setFileError(msg.error.message)
          break
        case 'total_test_end':
          pendingRun.current = false
          setStatus('done')
          break
      }
    })
    // `listen` is recreated every render but always targets the same client.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const run = () => {
    const client = getClient()
    if (!client) return
    setTests([])
    setFileError(null)
    setStatus('running')
    pendingRun.current = true
    client.dispatch({ type: 'run-all-tests' })
  }

  return { iframe, status, tests, fileError, run }
}
