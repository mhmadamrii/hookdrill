/// <reference lib="webworker" />
// Type-checks the user's files with the real TypeScript compiler, off the main
// thread. Everything it needs (lib files, React types) is bundled with the app,
// so checking works offline and sends no code anywhere.
import ts from 'typescript'
import type { TypeDiagnostic, WorkerRequest, WorkerResponse } from './protocol'

// Lib files load lazily: only the ones reachable from the configured libs.
const libLoaders = import.meta.glob<string>(
  '/node_modules/typescript/lib/lib.*.d.ts',
  {
    query: '?raw',
    import: 'default',
  },
)
const reactTypes = import.meta.glob<string>(
  [
    '/node_modules/@types/react/{index,global,jsx-runtime}.d.ts',
    '/node_modules/csstype/index.d.ts',
  ],
  { query: '?raw', import: 'default', eager: true },
)

const ROOT_LIBS = ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts']

const options: ts.CompilerOptions = {
  strict: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  lib: ROOT_LIBS,
  noEmit: true,
  skipLibCheck: true,
  esModuleInterop: true,
  isolatedModules: true,
  types: [],
}

/** Virtual file system: lib files under /lib, types under /node_modules, user files at /. */
const fs = new Map<string, string>()
const versions = new Map<string, number>()
let userFiles: string[] = []

async function loadLibs() {
  const queue = [...ROOT_LIBS]
  const seen = new Set<string>()
  while (queue.length) {
    const name = queue.shift()!
    if (seen.has(name)) continue
    seen.add(name)
    const load = libLoaders[`/node_modules/typescript/lib/${name}`]
    if (!load) continue
    const text = await load()
    fs.set(`/lib/${name}`, text)
    for (const [, ref] of text.matchAll(/<reference lib="([^"]+)"/g))
      queue.push(`lib.${ref.toLowerCase()}.d.ts`)
  }
  for (const [path, text] of Object.entries(reactTypes)) fs.set(path, text)
  fs.set(
    '/node_modules/@types/react/package.json',
    JSON.stringify({ name: '@types/react', types: 'index.d.ts' }),
  )
  fs.set(
    '/node_modules/csstype/package.json',
    JSON.stringify({ name: 'csstype', types: 'index.d.ts' }),
  )
}

const directories = () => {
  const dirs = new Set<string>(['/'])
  for (const path of fs.keys()) {
    const parts = path.split('/').slice(1, -1)
    for (let i = 1; i <= parts.length; i++)
      dirs.add('/' + parts.slice(0, i).join('/'))
  }
  return dirs
}

const host: ts.LanguageServiceHost = {
  getScriptFileNames: () => userFiles,
  getScriptVersion: (f) => String(versions.get(f) ?? 0),
  getScriptSnapshot: (f) => {
    const text = fs.get(f)
    return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text)
  },
  getCurrentDirectory: () => '/',
  getCompilationSettings: () => options,
  getDefaultLibFileName: () => '/lib/lib.d.ts',
  fileExists: (f) => fs.has(f),
  readFile: (f) => fs.get(f),
  directoryExists: (d) => directories().has(d.replace(/\/$/, '') || '/'),
  getDirectories: () => [],
}

const service = ts.createLanguageService(host, ts.createDocumentRegistry())

function check(files: Record<string, string>): TypeDiagnostic[] {
  userFiles = Object.keys(files).filter((p) => /\.(ts|tsx)$/.test(p))
  for (const path of userFiles) {
    if (fs.get(path) !== files[path]) {
      fs.set(path, files[path])
      versions.set(path, (versions.get(path) ?? 0) + 1)
    }
  }
  const out: TypeDiagnostic[] = []
  for (const path of userFiles) {
    const diagnostics = [
      ...service.getSyntacticDiagnostics(path),
      ...service.getSemanticDiagnostics(path),
    ]
    for (const d of diagnostics) {
      const from = d.start ?? 0
      out.push({
        path,
        from,
        to: from + Math.max(d.length ?? 1, 1),
        severity:
          d.category === ts.DiagnosticCategory.Error ? 'error' : 'warning',
        message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
        code: d.code,
      })
    }
  }
  return out
}

const post = (message: WorkerResponse) => self.postMessage(message)
const ready = loadLibs().then(
  () => post({ type: 'ready' }),
  (error: unknown) => post({ type: 'failed', message: String(error) }),
)

self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data
  if (request.type !== 'check') return
  await ready
  try {
    post({
      type: 'result',
      id: request.id,
      files: request.files,
      diagnostics: check(request.files),
    })
  } catch (error) {
    post({ type: 'failed', message: String(error) })
  }
})
