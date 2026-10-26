#!/usr/bin/env node
// Scaffolds a new React challenge from packages/challenges/template and
// registers it in the catalog and registry. Run from the repo root:
//
//   pnpm challenge:new
//   pnpm challenge:new --title "Star Rating" --difficulty easy --tags "State, Events" --summary "..."
//
// Node built-ins only, so it runs without a build step.

import { cp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const TEMPLATE = join(ROOT, 'template')
const SRC = join(ROOT, 'src')
const CATALOG = join(SRC, 'catalog.ts')
const REGISTRY = join(SRC, 'index.ts')
const DIFFICULTIES = ['easy', 'medium', 'hard']
const SLUG_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

// Each anchor is a comment line in the target file; new lines go right above it.
const ANCHORS = {
  catalogImport: '// challenge:new imports',
  catalogEntry: '// challenge:new catalog',
  loader: '// challenge:new loaders',
  solution: '// challenge:new solutions',
}

const { values: flags } = parseArgs({
  options: {
    title: { type: 'string' },
    slug: { type: 'string' },
    difficulty: { type: 'string' },
    tags: { type: 'string' },
    summary: { type: 'string' },
    yes: { type: 'boolean', short: 'y' },
    help: { type: 'boolean', short: 'h' },
  },
})

if (flags.help) {
  console.log(`Usage: pnpm challenge:new [options]

  --title <text>        Problem title, e.g. "Star Rating" (required)
  --slug <kebab-case>   URL slug (default: from the title)
  --difficulty <level>  easy | medium | hard (default: easy)
  --tags <list>         Comma-separated topic tags, e.g. "State, Events"
  --summary <text>      One line shown in problem lists
  -y, --yes             Don't prompt; use defaults for anything not given

Without flags it asks for each value.`)
  process.exit(0)
}

const fail = (message) => {
  console.error(`\n✖ ${message}`)
  process.exit(1)
}

const toSlug = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const toIdentifier = (slug) =>
  slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())

/** A JS string literal in the given quote style, escaping only what it must. */
const quote = (s, q) => q + s.replace(/\\/g, '\\\\').replaceAll(q, `\\${q}`) + q

async function collectAnswers() {
  const interactive = process.stdin.isTTY && !flags.yes
  const rl = interactive
    ? createInterface({ input: process.stdin, output: process.stdout })
    : null
  const ask = async (question, fallback) => {
    if (!rl) return fallback
    const answer = (
      await rl.question(`${question}${fallback ? ` (${fallback})` : ''}: `)
    ).trim()
    return answer || fallback
  }

  try {
    const title = flags.title ?? (await ask('Title', ''))
    if (!title?.trim()) fail('A title is required, e.g. --title "Star Rating".')
    const slug = flags.slug ?? (await ask('Slug', toSlug(title)))
    const difficulty = (
      flags.difficulty ??
      (await ask('Difficulty: easy, medium or hard', 'easy'))
    ).toLowerCase()
    const tags = flags.tags ?? (await ask('Tags, comma-separated', ''))
    const summary =
      flags.summary ??
      (await ask('One-line summary', `Build ${title.trim()} by hand.`))
    return {
      title: title.trim(),
      slug,
      difficulty,
      tags,
      summary: summary.trim(),
    }
  } finally {
    rl?.close()
  }
}

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function listFiles(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await listFiles(path)))
    else out.push(path)
  }
  return out
}

/** Inserts `line` directly above the anchor comment, keeping the anchor's indentation. */
function insertAbove(source, anchor, line, file) {
  const lines = source.split('\n')
  const i = lines.findIndex((l) => l.trim() === anchor)
  if (i === -1)
    fail(
      `Anchor "${anchor}" is missing from ${file}. Restore it before running this command.`,
    )
  const indent = lines[i].match(/^\s*/)[0]
  lines.splice(i, 0, indent + line)
  return lines.join('\n')
}

const answers = await collectAnswers()
const { title, slug, difficulty, summary } = answers
const tags = answers.tags
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean)

// Validate everything before touching the filesystem.
if (!SLUG_RE.test(slug))
  fail(
    `Slug "${slug}" must be kebab-case and start with a letter, e.g. "star-rating".`,
  )
if (!DIFFICULTIES.includes(difficulty))
  fail(`Difficulty must be one of: ${DIFFICULTIES.join(', ')}.`)
if (!summary) fail('A one-line summary is required.')

const target = join(SRC, 'react', slug)
if (await exists(target))
  fail(`packages/challenges/src/react/${slug} already exists.`)

const catalogSource = await readFile(CATALOG, 'utf8')
const registrySource = await readFile(REGISTRY, 'utf8')
if (
  catalogSource.includes(`'./react/${slug}/meta'`) ||
  registrySource.includes(`'${slug}':`)
)
  fail(`"${slug}" is already registered.`)

const ident = toIdentifier(slug)
let catalog = insertAbove(
  catalogSource,
  ANCHORS.catalogImport,
  `import { meta as ${ident} } from './react/${slug}/meta'`,
  'src/catalog.ts',
)
catalog = insertAbove(
  catalog,
  ANCHORS.catalogEntry,
  `${ident},`,
  'src/catalog.ts',
)
let registry = insertAbove(
  registrySource,
  ANCHORS.loader,
  `'${slug}': () => import('./react/${slug}'),`,
  'src/index.ts',
)
registry = insertAbove(
  registry,
  ANCHORS.solution,
  `'${slug}': () => import('./react/${slug}/solution'),`,
  'src/index.ts',
)

// Template tokens appear inside quoted strings ('__TITLE__' in .ts, "__TITLE__" in .jsx);
// each quoted occurrence is replaced with a properly escaped literal.
const values = {
  __ID__: `react-${slug}`,
  __SLUG__: slug,
  __TITLE__: title,
  __DIFFICULTY__: difficulty,
  __SUMMARY__: summary,
}
const fill = (text) => {
  for (const [token, value] of Object.entries(values))
    for (const q of ["'", '"'])
      text = text.replaceAll(q + token + q, quote(value, q))
  return text.replaceAll('__TAGS__', tags.map((t) => quote(t, "'")).join(', '))
}

try {
  await cp(TEMPLATE, target, {
    recursive: true,
    filter: (src) => relative(TEMPLATE, src) !== 'README.md',
  })
  for (const file of await listFiles(target)) {
    await writeFile(file, fill(await readFile(file, 'utf8')))
  }
  await writeFile(CATALOG, catalog)
  await writeFile(REGISTRY, registry)
} catch (error) {
  // Leave no half-made challenge behind; the registry files are written last.
  await rm(target, { recursive: true, force: true })
  await writeFile(CATALOG, catalogSource)
  await writeFile(REGISTRY, registrySource)
  fail(`Could not create the challenge: ${error.message}`)
}

console.log(`
✔ Created "${title}" (${difficulty}) at packages/challenges/src/react/${slug}/
  Registered in src/catalog.ts and src/index.ts.

Next steps
  1. Replace the example counter: description.md, hints.ts, starter/, solution/, tests/.
  2. pnpm dev, open http://localhost:3000/problems/${slug}
     Run: every test must fail. Load reference solution (sparkle button), Run: every test must pass.
  3. pnpm db:sync-challenges   so the database knows about it.
  4. pnpm typecheck && pnpm format

Guide: packages/challenges/template/README.md`)
