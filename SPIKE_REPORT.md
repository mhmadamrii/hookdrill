# HookDrill spike report: React challenge loop

**Verdict: the loop works end to end, all in the browser.** You get a problem, hints, an editor, a live preview, and hidden RTL + user-event tests with a custom results panel. Getting there took three non-obvious workarounds, which are covered below. Each one was found and confirmed by running it in a real browser.

## What works and how to run it

```bash
pnpm install
pnpm dev          # http://localhost:3000 → "Todo List"
```

- `/` lists challenges from the registry. `/challenges/todo-list` is the two-column workspace:
  - Left: title, difficulty badge, markdown requirements with the selector table, and hints revealed one at a time (each one collapsible).
  - Right: Sandpack editor (`App.jsx` only), live preview, and **Run tests**, which shows each test's name, pass/fail, and failure message.
- **Reset code** restores the starter. **Load reference solution (dev only)** appears only under `import.meta.env.DEV`.
- `pnpm build` and `tsc --noEmit` both pass.

**Verification.** A headless Chrome run with a Playwright script drove the real UI. The script is not committed; it was a throwaway in the scratchpad.

| Code loaded                                                    | Result                                                                  |
| -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `starter/App.jsx`                                              | **0 / 6 passed** (all fail with real assertion messages)                |
| `solution/App.jsx`                                             | **6 / 6 passed**                                                        |
| Solution with an injected delete bug, typed through the editor | 4 / 6: exactly `deletes a todo` and `keeps the other todos intact` fail |
| Syntax error typed into the editor                             | Preview shows the compile error, tests report "Test file failed to run" |

The checks also confirmed that the preview re-renders while you type, that a todo added inside the preview appears, that hints reveal in order, and that Reset works. A clean `rm -rf node_modules && pnpm install && pnpm dev` from the root also works.

**Load time** (fresh browser profile, cold CDN cache, fast connection): the workspace is ready in about **3.5–6.5 s**. The first test run takes about **2.5–5 s**, which includes Jest booting inside the bundler. Later runs are similar, because RTL interactions dominate.

## Setup choices (versus goal.md)

- **Scaffold:** `npx @tanstack/cli create` (the current CLI; the docs recommend it alongside TanStack Builder). Tailwind v4 now ships in standard scaffolds through `@tailwindcss/vite`, with no config file. I used `--no-examples --no-toolchain` and removed the devtools packages.
- **`src/client.tsx` added.** It is the default client entry without `<StrictMode>`. See hard part #1.
- **pnpm 12:** build-script approvals live under `allowBuilds` in `pnpm-workspace.yaml`. `es5-ext`, a transitive Sandpack dependency with a postinstall script, is set to `false`. Without that line, `pnpm add` fails with `ERR_PNPM_IGNORED_BUILDS`.
- **Layout changes:**
  - Added `react/todo-list/index.ts`, which assembles the challenge content and is loaded lazily, and `solution/index.ts`, a dev-only loader. Registering a new challenge takes 2 lines in `src/index.ts`: one for the metadata and content loader, one for the solution loader.
  - Merged `HintList` into `ProblemPanel.tsx`.
  - `EditorPane` stays inline in `ChallengeWorkspace` because it is one Sandpack component.
  - Added `PreviewPane.tsx` (see hard part #3).
- Challenge content is imported with Vite `?raw`, so `.jsx` and `.md` stay real files. This couples `packages/challenges` to Vite.
- Toggle state needed a testable contract, so the requirements now say each `todo-item` has `data-done="true|false"`.

## What was hard or surprising

1. **React StrictMode breaks Sandpack.** TanStack Start's default client entry wraps the app in `<StrictMode>`. The double mount makes `useSandpackClient` register each bundler iframe twice, and the surviving client never gets answers: the preview is blank and test runs hang forever. Sandpack's own `<SandpackTests>` fails the same way. I confirmed this with an A/B test: StrictMode on hangs, StrictMode off works. Fix: a custom `src/client.tsx` without StrictMode, which costs us StrictMode's dev checks for the whole app.
2. **In-browser Jest is a hybrid environment.** Tests render into the iframe's **real DOM**, but the globals (`window.getComputedStyle`, `KeyboardEvent`, `HTMLInputElement`) come from a bundled **jsdom 16.3.0**. Two symptoms:
   - `userEvent.setup()` with defaults throws `The provided value is not of type 'Element'`.
   - `user.type` silently dispatches events React never sees, so the input stays empty.

   Fix: `userEvent.setup({ document })`. `render`, `within`, and `fireEvent` work as-is. Every test author has to know this; it is commented in the test file.

3. **Test errors leak into the preview.** `SandpackProvider` keeps a single error state fed by **every** client, so failures from the hidden test runner sometimes covered the live preview with "Something went wrong: expect(received)…". This was a race: it showed in 1 of 2 runs. Fix: `PreviewPane` turns off Sandpack's overlay and draws its own, listening only to the preview's client id. Afterwards there was no leak in 3 runs, and syntax errors still show.
4. **The test protocol is undocumented.** The docs cover only `<SandpackTests>` props. Reading the source showed that the first `run-all-tests` only boots Jest. The bundler replies `initialize_tests`, and you must send `run-all-tests` again. Results then stream as `add_test`, `test_end` (with `errors[]`), `file_error`, and `total_test_end`. The custom UI uses this through the public `useSandpackClient()` hook, the same way `<SandpackTests>` does internally. It is undocumented, so it could change.

## What does not work or is flaky

- **Custom results UI: works.** It listens to Sandpack test events, so no fallback to `<SandpackTests>` was needed.
- **Hidden test files: partly hidden.** `hidden: true` plus `visibleFiles` removes them from the editor tabs. They are still sent to the bundler and readable in DevTools.
- **Syntax errors in user code:** the test panel only says `/App.jsx: hasn't been transpiled yet.` The preview shows the useful message, which Sandpack wraps as `TypeError: Cannot assign to read only property 'message'…`.
- **Run button timing:** tests run against whatever the bundler last compiled. Clicking **Run tests** within about 1 s of typing could test slightly stale code. I didn't see this in the runs, but I didn't guard against it. A fix is to wait for the test client's next `done`.
- **The flaky overlay race** (#3) is fixed structurally, but only 3 clean runs back that up.

## Known limitations

- **Tests ship to the client.** Anyone can read them. The registry is lazy: only metadata sits in the main chunk, and each challenge's content (description, hints, starter, tests) is loaded with `import()` into its own chunk. **Reference solutions are not in production builds.** They load only through `getSolutionFiles()`, which is behind an `import.meta.env.DEV` literal, and a grep of the `pnpm build` output finds no solution code.
- **External runtime dependency:** code runs on CodeSandbox's hosted bundler (`2-19-8-sandpack.codesandbox.io`) and npm CDNs (jsdelivr, CodeSandbox packager). Offline or blocked networks break it, and we can't control its uptime or versions.
- **Old Jest and jsdom inside the bundler:** jsdom 16.3. No `@testing-library/jest-dom` was attempted; plain `expect` was used.
- **Not attempted:** drag-and-drop, timers or fake timers, async data fetching, CSS/visual checks, multi-file challenges (the type supports them, but they weren't exercised), and mobile layout.
- **`/challenges/$slug` has `ssr: false`.** There is no SEO or SSR for the workspace.
- No persistence. Reloading loses your code, as goal.md scoped.

## Assessment: viable for about 50 UI challenges?

**Yes, for a prototype or early product.** Adding a challenge means adding one folder plus one line in the registry, with no UI changes. Running tests on the client costs nothing in servers. The top 3 risks:

1. **Undocumented Sandpack internals:** the test message protocol, the hybrid Jest environment, StrictMode breakage, and shared error state. Every workaround depends on Sandpack behavior that isn't a public contract, and Sandpack's release pace is slow (the last publish was April 2025).
2. **Grading integrity:** tests and solutions are visible on the client, and pass/fail is computed there. That is fine for practice. It is not fine for anything that counts (streaks, leaderboards, certificates) without re-running tests on a server.
3. **Test authoring friction and limits:** each author must know the `{ document }`/`within(container)` rules and stay inside what jsdom 16 can do. More complex challenges (timers, fetch mocking, drag-and-drop) may hit environment walls that a normal Vitest/jsdom setup wouldn't.

## Recommended next step

1. ~~Make the registry lazy and drop solutions from the client.~~ Done.
2. Add a CI check that runs each challenge's `tests/` against `solution/` (should pass) and `starter/` (should fail) under plain Vitest + jsdom outside Sandpack. This catches broken challenges early and gives a second runtime for comparison.
3. Then build 2–3 harder challenges (async fetch, timers, a modal with focus management) to find where in-browser Jest breaks, before committing to Sandpack long-term. Also time a self-hosted bundler versus a server-side or WebContainer runner.
