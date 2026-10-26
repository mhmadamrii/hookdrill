# Challenge template

Don't copy this folder by hand. From the repo root, run:

```bash
pnpm challenge:new
```

It asks for a title, slug, difficulty, tags and a one-line summary, then:

1. Copies this folder to `packages/challenges/src/react/<slug>/`, filling in the placeholders (`__TITLE__`, `__SLUG__`, …). This README is not copied.
2. Registers the challenge in `src/catalog.ts` (order in the problem list) and `src/index.ts` (content loader and dev-only solution loader).

You can also pass everything as flags:

```bash
pnpm challenge:new --title "Star Rating" --difficulty easy --tags "State, Events" --summary "Build a 5-star rating input with hover preview."
```

The scaffold is a working counter: its starter fails every test and its solution passes every test. Replace it with your challenge.

## What each file is for

| File                       | Purpose                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `meta.ts`                  | Id, slug, title, difficulty, tags and summary. Shown in problem lists and synced to the database.                         |
| `description.md`           | The problem statement in markdown. Keep the shape: intro line, Requirements, then the `data-testid` table.                |
| `hints.ts`                 | Revealed one at a time. Go from a nudge to almost the answer.                                                             |
| `starter/App.tsx`          | What the user starts with: markup with the required test ids, no behaviour.                                               |
| `solution/App.tsx`         | Reference solution. Shipped only in development builds ("Load reference solution").                                       |
| `solution/index.ts`        | Lists every editable file of the solution, keyed like `starterFiles`.                                                     |
| `tests/challenge.test.tsx` | The test suite, hidden from the editor.                                                                                   |
| `index.ts`                 | Assembles the challenge: starter files, test files, sandbox dependencies. Add extra starter files here (e.g. `songs.ts`). |

## Checklist before opening a pull request

- [ ] Every requirement in `description.md` is covered by at least one test, and every `data-testid` the tests use is in the table.
- [ ] With the starter, **every** test fails. A test that passes on an empty component tests nothing.
- [ ] With the reference solution, **every** test passes. In development, open `/problems/<slug>`, use the sparkle button (Load reference solution), then press Run.
- [ ] Hints are ordered from vague to specific and never paste the full answer.
- [ ] Starter and solution both show **No type errors** in the editor footer.
- [ ] `pnpm typecheck` and `pnpm format:check` pass.
- [ ] After merging, deploy runs `pnpm db:sync-challenges` so the database knows about the new problem.

## Writing in TypeScript

Challenges are TypeScript (`.tsx`/`.ts`) and run in Sandpack's `react-ts` template. The sandbox strips types when running, but the editor type-checks every editable file with TypeScript in strict mode (React 19 types, ES2022 + DOM libs), and shows errors inline. Starters and solutions must show **No type errors** in the editor footer. Import local files without an extension (`import App from "../App"`).

## Writing tests: sandbox rules

Tests run in Sandpack's in-browser Jest, which renders into a real DOM but exposes jsdom 16 globals. The template's `setup()` already handles this:

- Create user-event with `userEvent.setup({ document, delay: null })`.
  - Without `document`, typing silently does nothing or throws `The provided value is not of type 'Element'`.
  - Without `delay: null`, user-event waits on a timer between every action. Browsers throttle timers when the tab is in the background, so runs crawl and tests hit Jest's 5 s timeout.
- Query inside the rendered container (`within(container)`), not `screen`.
- Stick to plain `expect` matchers; `jest-dom` isn't available.
- Users build the component their own way, so assert on behaviour through `data-testid`s and attributes (`disabled`, `data-*`, text). Never assert on class names or markup structure.
