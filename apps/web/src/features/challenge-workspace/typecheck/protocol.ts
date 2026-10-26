export interface TypeDiagnostic {
  /** Sandbox path, e.g. "/App.tsx". */
  path: string
  from: number
  to: number
  severity: 'error' | 'warning'
  message: string
  /** TypeScript error code, e.g. 2322. */
  code: number
}

export type WorkerRequest = {
  type: 'check'
  id: number
  files: Record<string, string>
}

export type WorkerResponse =
  | { type: 'ready' }
  | {
      type: 'result'
      id: number
      files: Record<string, string>
      diagnostics: TypeDiagnostic[]
    }
  | { type: 'failed'; message: string }
