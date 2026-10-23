import { useEffect, useMemo, useRef, useState } from 'react'
import {
  SandpackCodeEditor,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react'
import type { SandpackFiles } from '@codesandbox/sandpack-react'
import { CloudUpload, Code2, Loader2, Play, RotateCcw, Sparkles } from 'lucide-react'
import { getSolutionFiles } from '@hookdrill/challenges'
import type { Challenge, FileMap } from '@hookdrill/challenges'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ConsolePanel, type ConsoleTab } from './ConsolePanel'
import { editorTheme } from './editor-theme'
import { Panel, PanelTabs } from './panel'
import { ProblemPanel, type ProblemRecord } from './ProblemPanel'
import { TestRunnerProvider, useRunner, type RunMode, type TestRunResult } from './test-runner'

export type { ProblemRecord, TestRunResult }

export interface ChallengeWorkspaceProps {
  challenge: Challenge
  /** Display number in the problem list. */
  number: number
  tags: string[]
  record: ProblemRecord | null
  signedIn: boolean
  /** Saved code; paths the challenge doesn't have are ignored. */
  initialFiles?: FileMap
  initialHintsRevealed?: number
  /** Called with the editable files after every edit (debounce on the caller's side). */
  onFilesChange?: (files: FileMap) => void
  onTestRunComplete?: (result: TestRunResult) => void
  onHintReveal?: (count: number) => void
  /** Short status under the editor, e.g. draft save state. */
  status?: React.ReactNode
  /** Left side of the top bar (problem list navigation). */
  nav?: React.ReactNode
  /** Right side of the top bar (theme, account). */
  actions?: React.ReactNode
}

export function ChallengeWorkspace(props: ChallengeWorkspaceProps) {
  const { challenge, initialFiles, onFilesChange, onTestRunComplete } = props
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
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>('preview')

  return (
    <SandpackProvider
      template="react"
      theme={editorTheme}
      files={files}
      customSetup={customSetup}
      options={{ visibleFiles: editable, activeFile: editable[0] }}
    >
      {onFilesChange && <FileWatcher paths={editable} onChange={onFilesChange} />}
      <TestRunnerProvider onComplete={onTestRunComplete}>
        <div className="flex h-dvh flex-col bg-background text-foreground">
          <TopBar
            nav={props.nav}
            actions={props.actions}
            onRun={() => setConsoleTab('result')}
          />
          <Layout
            {...props}
            consoleTab={consoleTab}
            onConsoleTab={setConsoleTab}
          />
        </div>
      </TestRunnerProvider>
    </SandpackProvider>
  )
}

function TopBar({
  nav,
  actions,
  onRun,
}: {
  nav?: React.ReactNode
  actions?: React.ReactNode
  onRun: () => void
}) {
  const { status, run } = useRunner()
  const busy = status === 'loading' || status === 'running'
  const start = (mode: RunMode) => {
    if (busy) return
    onRun()
    run(mode)
  }
  const startRef = useRef(start)
  startRef.current = start

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key === "'") {
        e.preventDefault()
        startRef.current('run')
      } else if (e.key === 'Enter') {
        e.preventDefault()
        startRef.current('submit')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="grid h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 px-2 md:px-3">
      <div className="flex min-w-0 items-center gap-1">{nav}</div>
      <div className="flex items-center gap-1 rounded-lg bg-card p-1 shadow-xs ring-1 ring-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => start('run')}>
              {status === 'running' ? <Loader2 className="animate-spin" /> : <Play className="fill-current" />}
              Run
            </Button>
          </TooltipTrigger>
          <TooltipContent>Run public tests · Ctrl/⌘ + '</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              disabled={busy}
              onClick={() => start('submit')}
              className="bg-accepted text-white hover:bg-accepted/90"
            >
              <CloudUpload /> Submit
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {status === 'loading' ? 'Starting the test runner…' : 'Submit · Ctrl/⌘ + Enter'}
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center justify-end gap-1">{actions}</div>
    </header>
  )
}

function Layout(
  props: ChallengeWorkspaceProps & {
    consoleTab: ConsoleTab
    onConsoleTab: (tab: ConsoleTab) => void
  },
) {
  const mobile = useIsMobile()
  const problem = (
    <Panel>
      <ProblemPanel
        challenge={props.challenge}
        number={props.number}
        tags={props.tags}
        record={props.record}
        signedIn={props.signedIn}
        hintsRevealed={props.initialHintsRevealed}
        onHintReveal={props.onHintReveal}
      />
    </Panel>
  )
  const code = <CodePanel challenge={props.challenge} status={props.status} />
  const consolePanel = <ConsolePanel tab={props.consoleTab} onTabChange={props.onConsoleTab} />

  if (mobile) {
    return (
      <Tabs defaultValue="problem" className="flex min-h-0 flex-1 flex-col gap-2 px-2 pb-2">
        <TabsList className="w-full">
          <TabsTrigger value="problem">Problem</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="console">Preview & tests</TabsTrigger>
        </TabsList>
        <TabsContent value="problem" className="min-h-0 flex-1">{problem}</TabsContent>
        <TabsContent value="code" forceMount className="min-h-0 flex-1 data-[state=inactive]:hidden">{code}</TabsContent>
        <TabsContent value="console" forceMount className="min-h-0 flex-1 data-[state=inactive]:hidden">{consolePanel}</TabsContent>
      </Tabs>
    )
  }

  return (
    <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1 px-2 pb-2">
      <ResizablePanel defaultSize="42" minSize="25">
        {problem}
      </ResizablePanel>
      <Gutter />
      <ResizablePanel defaultSize="58" minSize="30">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize="58" minSize="20">
            {code}
          </ResizablePanel>
          <Gutter />
          <ResizablePanel defaultSize="42" minSize="15">
            {consolePanel}
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

/** An 8px transparent gap that is the resize handle, with a hover line. */
function Gutter() {
  return (
    <ResizableHandle className="bg-transparent p-1 transition-colors after:hidden hover:bg-primary/40 data-[separator=active]:bg-primary/60 aria-[orientation=horizontal]:h-2 aria-[orientation=vertical]:w-2" />
  )
}

function CodePanel({ challenge, status }: { challenge: Challenge; status?: React.ReactNode }) {
  const { sandpack } = useSandpack()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <Panel>
      <PanelTabs className="justify-between">
        <span className="flex items-center gap-1.5 px-2 font-medium">
          <Code2 className="size-4 text-accepted" /> Code
          <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
            React · JSX
          </span>
        </span>
        <span className="flex items-center gap-0.5">
          {import.meta.env.DEV && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Load reference solution (development only)"
                  onClick={async () => {
                    const solution = await getSolutionFiles(challenge.slug)
                    if (solution) sandpack.updateFile(solution)
                  }}
                >
                  <Sparkles />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Load reference solution (dev only)</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Reset to starter code" onClick={() => setConfirmReset(true)}>
                <RotateCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to starter code</TooltipContent>
          </Tooltip>
        </span>
      </PanelTabs>
      <div className="min-h-0 flex-1 [&_.sp-wrapper]:h-full [&_.sp-stack]:h-full">
        <SandpackCodeEditor
          showTabs
          showLineNumbers
          showInlineErrors
          wrapContent={false}
          style={{ height: '100%' }}
        />
      </div>
      <div className="flex h-7 shrink-0 items-center justify-between border-t px-3 text-xs text-muted-foreground">
        <span>{status ?? 'Not saved'}</span>
        <span>No autocomplete. That's the point.</span>
      </div>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset to starter code?</DialogTitle>
            <DialogDescription>
              Your current code in every file of this problem is replaced with the starter. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep my code</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                sandpack.updateFile(challenge.starterFiles)
                setConfirmReset(false)
              }}
            >
              Reset code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  )
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return mobile
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
