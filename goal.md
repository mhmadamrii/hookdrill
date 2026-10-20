# Project: HookDrill, minimal reproduction (spike)

## Context
HookDrill is a practice platform for developers who want to keep their coding fundamentals sharp in the age of AI agents. Eventually it will have DSA challenges (LeetCode-style) and React/UI challenges (build a real component, verified by automated tests).

This task is a **spike**, not the real product. The goal is to find out, with minimum code, whether the core React/UI-challenge loop is feasible and how hard it is to build. Build the smallest thing that proves the loop works end to end.

## Stack (fixed)
- pnpm workspaces monorepo
- TanStack Start (React, TypeScript)
- Tailwind CSS (use it if it integrates cleanly; otherwise plain CSS)
- In-browser code execution and preview via Sandpack (`@codesandbox/sandpack-react`)

**Important:** Do not rely on memory for setup or APIs. Read the current official docs for TanStack Start, Tailwind, and Sandpack before using them, and use the currently recommended setup. If something I describe conflicts with the current docs, follow the docs and tell me.

## What the spike must do
One challenge only: **Todo List**. A single page that renders:
1. **The question**: title, difficulty badge, description, and requirements (markdown or plain text).
2. **The hints**: collapsible, revealed one at a time (hint 1, then hint 2, ...).
3. **The editor**: the user edits the starter code for the challenge (start with `App.jsx`).
4. **The live preview**: renders the user's component as they type.
5. **The test cases**: a "Run tests" button executes a hidden test file against the user's code and shows each test case by name with pass/fail and the failure message.

Everything runs client-side. No backend.

## The Todo challenge spec
User edits `App.jsx` (default export `App`). Requirements shown to the user:
- Create: typing in the input and clicking Add (or pressing Enter) adds a todo. Empty or whitespace-only input adds nothing.
- Update: each todo can be edited (user-chosen UX, but must expose the test ids below) and the new text is saved.
- Delete: each todo can be removed.
- Toggle complete: each todo can be marked done and undone.

Required selectors (the test suite depends on these, so list them in the requirements shown to the user):
`todo-input`, `add-button`, `todo-item`, `todo-text`, `toggle-button`, `edit-button`, `edit-input`, `save-button`, `delete-button`.

Write the test file with React Testing Library and `@testing-library/user-event`. About 6 tests covering: adds a todo, ignores empty input, deletes a todo, edits a todo, toggles complete, and keeps the other items intact after a delete. Provide a starter `App.jsx` with a minimal skeleton (not a solution), and a reference solution that passes all tests. Use the reference solution to verify that the test suite is correct.

## Scalability requirements (folder structure)
This will grow into many challenges, multiple difficulty levels, and later DSA challenges, auth, and a database. Structure for that now, but do not build any of those things. Proposed layout (adjust if the current docs suggest a better convention, and explain changes):

```
hookdrill/
├─ pnpm-workspace.yaml
├─ package.json
├─ apps/
│  └─ web/                          # TanStack Start app
│     └─ src/
│        ├─ routes/                 # __root, index (challenge list), challenges.$slug
│        ├─ features/
│        │  └─ challenge-workspace/ # ProblemPanel, HintList, EditorPane,
│        │                          # PreviewPane, TestResults, hooks
│        ├─ components/ui/          # small shared primitives
│        └─ styles/
└─ packages/
   └─ challenges/                   # challenge content, data only, no UI
      └─ src/
         ├─ types.ts                # Challenge type (shared contract)
         ├─ index.ts                # registry: getChallenge(slug), listChallenges()
         └─ react/
            └─ todo-list/
               ├─ meta.ts           # id, slug, title, difficulty, track
               ├─ description.md
               ├─ hints.ts
               ├─ starter/App.jsx
               ├─ solution/App.jsx  # reference solution, used to verify tests
               └─ tests/todo.test.jsx
```

Rules:
- A challenge is **data** defined by the `Challenge` type. Adding a new challenge must not require touching UI code.
- Isolate all Sandpack usage inside `features/challenge-workspace`. The rest of the app must not import Sandpack directly, so the execution layer can be swapped later (for example for Judge0 on DSA challenges).
- Routes load challenges by slug through the registry, even though there is only one challenge.

## Out of scope (do not build)
Auth, database, submissions or persistence, user accounts, DSA challenges, AI features, leaderboards, multiple languages, Monaco editor (Sandpack's default editor is fine), polished design. Styling should be clean and minimal: Tailwind utilities, a two-column workspace layout (problem and hints on the left, editor, preview, and results on the right).

## Process
1. First, read the docs and give me a short plan: scaffold approach, how you'll run tests in the browser, and any risks you foresee. Then proceed.
2. Build the minimal version. Prefer fewer files and less abstraction wherever it doesn't conflict with the scalability rules above.
3. **Do not fake anything.** If Sandpack's test runner cannot do something I asked for (for example custom result UI, hidden test files, or React Testing Library support), say so, show what you tried, and implement the closest honest fallback. For the results panel, prefer a custom UI that listens to Sandpack's test events if that is supported; otherwise use Sandpack's built-in test component and note the limitation.
4. Verify the solution: with `solution/App.jsx` loaded, all tests must pass. With `starter/App.jsx` loaded, they must fail. Confirm both by actually running them.
5. Make sure `pnpm install` then `pnpm dev` works from the repo root.

## Deliverable: SPIKE_REPORT.md at the repo root
Short and honest. Include:
- What works and how to run it
- What was hard or surprising (setup, test runner, hidden tests, load time)
- What does not work or is flaky, and the fallback used
- Known limitations (for example: tests ship to the client, so users can read them; drag-and-drop testing not attempted)
- Your assessment: is this approach viable for scaling to ~50 UI challenges, and what are the top 3 risks?
- Recommended next step
