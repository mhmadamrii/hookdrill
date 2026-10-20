import {
  SandpackCodeEditor,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react'
import type { SandpackFiles } from '@codesandbox/sandpack-react'
import { getSolutionFiles } from '@hookdrill/challenges'
import type { Challenge } from '@hookdrill/challenges'
import { PreviewPane } from './PreviewPane'
import { ProblemPanel } from './ProblemPanel'
import { TestResults } from './TestResults'

export function ChallengeWorkspace({ challenge }: { challenge: Challenge }) {
  const editable = Object.keys(challenge.starterFiles)

  return (
    <SandpackProvider
      template="react"
      files={toSandpackFiles(challenge)}
      customSetup={{ dependencies: challenge.dependencies }}
      options={{ visibleFiles: editable, activeFile: editable[0] }}
    >
      <div className="grid h-[calc(100vh-41px)] grid-cols-1 lg:grid-cols-[minmax(320px,2fr)_3fr]">
        <ProblemPanel challenge={challenge} />
        <section className="flex min-h-0 flex-col gap-3 overflow-y-auto border-l border-zinc-200 p-3">
          <Toolbar challenge={challenge} />
          <div className="overflow-hidden rounded-lg border border-zinc-200">
            <SandpackCodeEditor showLineNumbers style={{ height: '42vh' }} />
          </div>
          <PreviewPane />
          <TestResults />
        </section>
      </div>
    </SandpackProvider>
  )
}

function Toolbar({ challenge }: { challenge: Challenge }) {
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
    </div>
  )
}

function toSandpackFiles(challenge: Challenge): SandpackFiles {
  const [mainPath] = Object.keys(challenge.starterFiles)
  // Override the template entry so it renders the challenge's main file.
  const files: SandpackFiles = {
    '/index.js': {
      code: `import { createRoot } from "react-dom/client";\nimport App from ".${mainPath}";\n\ncreateRoot(document.getElementById("root")).render(<App />);\n`,
      hidden: true,
    },
  }
  for (const [path, code] of Object.entries(challenge.starterFiles)) {
    files[path] = { code }
  }
  for (const [path, code] of Object.entries(challenge.testFiles)) {
    files[path] = { code, hidden: true }
  }
  return files
}
