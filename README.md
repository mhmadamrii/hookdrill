# HookDrill

Practice platform for keeping coding fundamentals sharp. This repo is currently a **spike**: one React challenge (Todo List) with an in-browser editor, live preview, and hidden tests that run against your code. Findings are in [SPIKE_REPORT.md](./SPIKE_REPORT.md).

## Quick start

Requires Node 22+ and pnpm (`packageManager` pins the version; `corepack enable` picks it up).

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Open a challenge, edit `App.jsx`, watch the preview, click **Run tests**.

## Scripts (repo root)

| Script              | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `pnpm dev`          | Start the web app (Vite dev server, port 3000) |
| `pnpm build`        | Production build of the web app                |
| `pnpm format`       | Format all files with Prettier                 |
| `pnpm format:check` | Check formatting without writing (for CI)      |

## Stack

- pnpm workspaces monorepo
- [TanStack Start](https://tanstack.com/start) (React, TypeScript, file-based routing)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- [Sandpack](https://sandpack.codesandbox.io) for the editor, preview, and in-browser Jest test runner
- React Testing Library + `@testing-library/user-event` inside the sandbox
- Prettier

## Layout

```
apps/web/                      TanStack Start app
  src/routes/                  __root, index (challenge list), challenges.$slug
  src/features/challenge-workspace/
                               the only place that imports Sandpack
                               (editor, preview, test runner hook, results UI)
  src/components/ui/           small shared primitives
  src/client.tsx               client entry without StrictMode (see below)
packages/challenges/           challenge content, data only, no UI
  src/types.ts                 Challenge type (shared contract)
  src/index.ts                 registry: listChallenges(), getChallenge(slug), getSolutionFiles(slug)
  src/react/todo-list/         meta, description.md, hints, starter/, solution/, tests/
```

## Adding a challenge

1. Create `packages/challenges/src/react/<slug>/` with the same shape as `todo-list/`:
   - `meta.ts`: id, slug, title, difficulty, track, summary
   - `description.md`, `hints.ts`
   - `starter/App.jsx`: what the user starts with (default export `App`)
   - `solution/App.jsx` + `solution/index.ts`: reference solution
   - `tests/*.test.jsx`: hidden test suite
   - `index.ts`: assembles the `Challenge`
2. Register it in `packages/challenges/src/index.ts` (one line in `registry`, one in `solutions`).
3. Verify: in dev, open the challenge, click **Load reference solution (dev only)**, run tests. All must pass. Reset, run again: they must fail.

No UI code changes are needed.

### Writing tests: sandbox gotchas

Sandpack's in-browser Jest renders into a real DOM but exposes jsdom 16 globals. Follow the pattern in `todo-list/tests/todo.test.jsx`:

- Create user-event with `userEvent.setup({ document })`. Without it, typing silently does nothing or throws `The provided value is not of type 'Element'`.
- Query inside the rendered container (`within(container)`), not `screen`.
- Stick to plain `expect` matchers; `jest-dom` is untested here.
- Contract with the user is `data-testid` selectors; list every one in `description.md`.

## Known limitations

- Hidden tests are hidden from the editor only; they are sent to the browser and readable in DevTools. Pass/fail is computed client-side.
- Reference solutions are excluded from production builds (dev-only loader).
- Code runs on CodeSandbox's hosted bundler and npm CDNs, so a network connection is required.
- React StrictMode is disabled app-wide (`apps/web/src/client.tsx`) because it breaks Sandpack's client registration.

See [SPIKE_REPORT.md](./SPIKE_REPORT.md) for details, risks, and next steps.
