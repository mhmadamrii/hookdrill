import { useEffect, useMemo, useRef } from 'react'
import {
  SandpackCodeEditor,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react'
import type { SandpackFiles } from '@codesandbox/sandpack-react'
import { getSolutionFiles } from '@hookdrill/challenges'
import type { Challenge, FileMap } from '@hookdrill/challenges'
import { PreviewPane } from './PreviewPane'
import { ProblemPanel } from './ProblemPanel'
import { TestResults, type TestRunResult } from './TestResults'

export type { TestRunResult }

export interface ChallengeWorkspaceProps {
  challenge: Challenge
  /** Saved code; paths the challenge doesn't have are ignored. */
  initialFiles?: FileMap
  initialHintsRevealed?: number
  /** Called with the editable files after every edit (debounce on the caller's side). */
  onFilesChange?: (files: FileMap) => void
  onTestRunComplete?: (result: TestRunResult) => void
  onHintReveal?: (count: number) => void
  /** Short status shown in the toolbar, e.g. draft save state. */
  status?: React.ReactNode
}

export function ChallengeWorkspace({
  challenge,
  initialFiles,
  initialHintsRevealed,
  onFilesChange,
  onTestRunComplete,
  onHintReveal,
  status,
}: ChallengeWorkspaceProps) {
  const editable = Object.keys(challenge.starterFiles)
  // SandpackProvider resets every file whenever `files` or `customSetup` changes
  // by reference, so both must stay stable across re-renders.
  const files = useMemo(
    () => toSandpackFiles(challenge, initialFiles),
    [challenge, initialFiles],
  )
  const customSetup = useMemo(
    () => ({ dependencies: challenge.dependencies }),
    [challenge],
  )

  return (
    <SandpackProvider
      template="react"
      files={files}
      customSetup={customSetup}
      options={{ visibleFiles: editable, activeFile: editable[0] }}
    >
      {onFilesChange && (
        <FileWatcher paths={editable} onChange={onFilesChange} />
      )}
      <div className="grid h-[calc(100vh-56px)] grid-cols-1 lg:grid-cols-[minmax(320px,2fr)_3fr]">
        <ProblemPanel
          challenge={challenge}
          hintsRevealed={initialHintsRevealed}
          onHintReveal={onHintReveal}
        />
        <section className="flex min-h-0 flex-col gap-3 overflow-y-auto border-l border-zinc-200 p-3">
          <Toolbar challenge={challenge} status={status} />
          <div className="overflow-hidden rounded-lg border border-zinc-200">
            <SandpackCodeEditor showLineNumbers style={{ height: '42vh' }} />
          </div>
          <PreviewPane />
          <TestResults onComplete={onTestRunComplete} />
        </section>
      </div>
    </SandpackProvider>
  )
}

function Toolbar({
  challenge,
  status,
}: {
  challenge: Challenge
  status?: React.ReactNode
}) {
  const { sandpack } = useSandpack()

  return (
    <div className="flex gap-2 text-sm">
      <button
        className="rounded border border-zinc-300 bg-white px-3 py-1 hover:bg-zinc-100"
        onClick={() => sandpack.updateFile(challenge.starterFiles)}
      >
        Reset code
      </button>
      {import.meta.env.DEV && (
        <button
          className="rounded border border-dashed border-zinc-400 px-3 py-1 text-zinc-600 hover:bg-zinc-100"
          onClick={async () => {
            const files = await getSolutionFiles(challenge.slug)
            if (files) sandpack.updateFile(files)
          }}
        >
          Load reference solution (dev only)
        </button>
      )}
      {status && (
        <span className="ml-auto self-center text-xs text-muted-foreground">
          {status}
        </span>
      )}
    </div>
  )
}

/** Reports the editable files whenever their code changes, skipping the initial load. */
function FileWatcher({
  paths,
  onChange,
}: {
  paths: string[]
  onChange: (files: FileMap) => void
}) {
  const { sandpack } = useSandpack()
  const files = Object.fromEntries(
    paths.map((p) => [p, sandpack.files[p]?.code ?? '']),
  )
  const snapshot = JSON.stringify(files)
  const last = useRef(snapshot)
  const latest = useRef(onChange)
  latest.current = onChange

  useEffect(() => {
    if (snapshot === last.current) return
    last.current = snapshot
    latest.current(JSON.parse(snapshot))
  }, [snapshot])

  return null
}

function toSandpackFiles(
  challenge: Challenge,
  initialFiles?: FileMap,
): SandpackFiles {
  const [mainPath] = Object.keys(challenge.starterFiles)
  // Override the template entry so it renders the challenge's main file.
  const files: SandpackFiles = {
    '/index.js': {
      code: `import { createRoot } from "react-dom/client";\nimport App from ".${mainPath}";\n\ncreateRoot(document.getElementById("root")).render(<App />);\n`,
      hidden: true,
    },
  }
  for (const [path, code] of Object.entries(challenge.starterFiles)) {
    files[path] = { code: initialFiles?.[path] ?? code }
  }
  for (const [path, code] of Object.entries(challenge.testFiles)) {
    files[path] = { code, hidden: true }
  }
  return files
}
