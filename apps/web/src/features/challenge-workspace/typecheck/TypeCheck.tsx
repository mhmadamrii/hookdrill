import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useSandpack, type CodeEditorRef } from '@codesandbox/sandpack-react'
import {
  lintGutter,
  nextDiagnostic,
  setDiagnostics,
  type Diagnostic,
} from '@codemirror/lint'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TypeDiagnostic, WorkerResponse } from './protocol'

const DEBOUNCE_MS = 350

type Status = 'loading' | 'checking' | 'ready' | 'failed'

interface TypeCheckState {
  status: Status
  /** The files the latest result was computed for, so stale results can be skipped. */
  checked: Record<string, string> | null
  diagnostics: TypeDiagnostic[]
  errorCount: number
}

const TypeCheckContext = createContext<TypeCheckState>({
  status: 'loading',
  checked: null,
  diagnostics: [],
  errorCount: 0,
})

export const useTypeCheck = () => useContext(TypeCheckContext)

/** Type-checks the editable files in a worker whenever they change. */
export function TypeCheckProvider({
  paths,
  children,
}: {
  paths: string[]
  children: React.ReactNode
}) {
  const { sandpack } = useSandpack()
  const snapshot = JSON.stringify(
    Object.fromEntries(paths.map((p) => [p, sandpack.files[p]?.code ?? ''])),
  )
  const worker = useRef<Worker | null>(null)
  const latestId = useRef(0)
  const [status, setStatus] = useState<Status>('loading')
  const [result, setResult] = useState<{
    checked: Record<string, string>
    diagnostics: TypeDiagnostic[]
  } | null>(null)

  useEffect(() => {
    const w = new Worker(new URL('./typecheck.worker.ts', import.meta.url), {
      type: 'module',
    })
    w.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data
      if (msg.type === 'failed') setStatus('failed')
      else if (msg.type === 'result' && msg.id === latestId.current) {
        setResult({ checked: msg.files, diagnostics: msg.diagnostics })
        setStatus('ready')
      }
    }
    worker.current = w
    return () => w.terminate()
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const id = ++latestId.current
      setStatus((s) => (s === 'loading' ? s : 'checking'))
      worker.current?.postMessage({
        type: 'check',
        id,
        files: JSON.parse(snapshot),
      })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [snapshot])

  const value = useMemo<TypeCheckState>(
    () => ({
      status,
      checked: result?.checked ?? null,
      diagnostics: result?.diagnostics ?? [],
      errorCount:
        result?.diagnostics.filter((d) => d.severity === 'error').length ?? 0,
    }),
    [status, result],
  )
  return (
    <TypeCheckContext.Provider value={value}>
      {children}
    </TypeCheckContext.Provider>
  )
}

/** CodeMirror extensions the editor needs for type errors (gutter markers). */
export function useTypeCheckExtensions() {
  return useMemo(() => [lintGutter()], [])
}

/**
 * Pushes the latest diagnostics for the open file into the editor. Results for
 * code that has changed since are skipped; CodeMirror maps the previous
 * squiggles through edits until the next result arrives.
 */
export function EditorDiagnostics({
  editor,
}: {
  editor: React.RefObject<CodeEditorRef | null>
}) {
  const { sandpack } = useSandpack()
  const { checked, diagnostics } = useTypeCheck()
  const active = sandpack.activeFile

  useEffect(() => {
    // The editor view can be recreated on file switch; apply on the next frame.
    const frame = requestAnimationFrame(() => {
      const view = editor.current?.getCodemirror()
      if (!view || !checked) return
      const doc = view.state.doc.toString()
      if (checked[active] !== doc) return
      const forFile: Diagnostic[] = diagnostics
        .filter((d) => d.path === active)
        .map((d) => ({
          from: Math.min(d.from, doc.length),
          to: Math.min(d.to, doc.length),
          severity: d.severity,
          message: d.message,
          source: `ts(${d.code})`,
        }))
      view.dispatch(setDiagnostics(view.state, forFile))
    })
    return () => cancelAnimationFrame(frame)
  }, [editor, checked, diagnostics, active])

  return null
}

/** Footer status: "Checking types…", "No type errors", or a jump-to-error button. */
export function TypeStatus({
  editor,
}: {
  editor: React.RefObject<CodeEditorRef | null>
}) {
  const { status, errorCount, diagnostics } = useTypeCheck()
  const { sandpack } = useSandpack()

  if (status === 'failed') return <span>Type checking unavailable</span>
  if (status === 'loading')
    return (
      <span className="inline-flex items-center gap-1">
        <Loader2 className="size-3 animate-spin" /> Loading TypeScript…
      </span>
    )
  if (errorCount === 0)
    return (
      <span className="inline-flex items-center gap-1">
        {status === 'checking' ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <CheckCircle2 className="size-3 text-accepted" />
        )}
        No type errors
      </span>
    )

  const first = diagnostics.find((d) => d.severity === 'error')
  return (
    <button
      className={cn(
        'inline-flex items-center gap-1 text-wrong hover:underline',
      )}
      onClick={() => {
        if (first && first.path !== sandpack.activeFile)
          sandpack.setActiveFile(first.path)
        requestAnimationFrame(() => {
          const view = editor.current?.getCodemirror()
          if (!view) return
          view.focus()
          nextDiagnostic(view)
        })
      }}
    >
      <AlertCircle className="size-3" />
      {errorCount} type {errorCount === 1 ? 'error' : 'errors'}
    </button>
  )
}
