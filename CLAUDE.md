# HookDrill

A learning platform for future software builders: people build React components by hand in a Sandpack editor, judged by hidden tests, and take structured courses (AI Engineer first). pnpm monorepo: `apps/web` (TanStack Start, Vite, Tailwind v4 + shadcn), `apps/api` (Hono + tRPC v11 + Better Auth), `packages/db` (Drizzle on Postgres), `packages/challenges`, `packages/courses`. Scripts live in the root `package.json`.

Read before changing an area:

- Any UI or copy, however small: `apps/web/DESIGN.md` (tokens, components) and `apps/web/PRODUCT.md` (audience, voice). Use the impeccable skill for design work.
- System design, ranking (rating/fame), contests, courses: `ARCHITECTURE.md`
- Writing a challenge: `packages/challenges/template/README.md` (scaffold with `pnpm challenge:new`)
- Writing course content: `packages/courses/CONTENT.md`

## Working rules

- Commit only when asked.
- The user's dev servers run on :3000 (web) and :3001 (API). Leave them, and any process you didn't start, running. For your own checks, start web on a spare port: `cd apps/web && npx vite dev --port 3100 --strictPort`, and stop it when done.
- The local Postgres holds the user's own data. Migrations must be additive; delete any test users you create.
- Verify UI changes in a real browser (Playwright with `channel: 'chrome'` works here) at 1440, 1100 and 390px, light and dark, checking for console errors and horizontal scroll.
- Finish with `pnpm typecheck` and `pnpm format:check`.

## Routes (apps/web/src/routes)

Route groups own layouts: `(group)/route.tsx` is a pathless layout. A `(group).tsx` file beside the folder is rejected by the generator.

- `(main)/route.tsx`: site header. Landing, future, leaderboard, contests, dashboard, profile, signin, `u/$handle`.
- `(main)/(library)/route.tsx`: library sidebar + footer. `problems/`, `builder-lab`, `courses/`, `courses/$course/`.
- `(main)/(course)/route.tsx`: course outline beside lessons (`courses/$course/$lesson`) and exams (`courses/$course/exam/$submodule`). It reads `$course` with `useParams({ strict: false })`.
- `(workspace)/`: full-screen pages with their own top bar (`problems/$slug`, `playground`), no layout file.

Route ids include the groups (`'/(main)/leaderboard'`), so `useSearch({ from })` must use them. After moving routes, run `./node_modules/.bin/tsr generate` in `apps/web`.

## Sandpack test runner gotchas

Challenge tests run in Sandpack's in-browser Jest, which differs from real Jest:

- `jest` is only the module mocker: `jest.fn` and `jest.spyOn` work; fake timers and `jest.setTimeout` don't. Time-based challenges use a hand-rolled clock on `globalThis.__hookdrillClock` (see `countdown-timer`), with timer functions bound to `window`.
- Per-test timeout is set via `globalThis[Symbol.for('TEST_TIMEOUT_SYMBOL')]` (the workspace injects 15s).
- Each test file is evaluated twice per run, so any state shared across tests lives on `globalThis`.
- The test iframe is hidden: no layout, no IntersectionObserver. Busy loops get killed by loop protection.
- Async dependencies are injected as props with defaults (`search`, `fetchPage`) and resolved by hand inside `act(async)`.
- user-event: `userEvent.setup({ document, delay: null })`.

A challenge is done when its starter passes 0/N tests, its solution passes N/N, and it has no type errors. Register it in `catalog.ts` and `index.ts`, then `pnpm db:sync-challenges`.

## App gotchas

- Better Auth refetches the session on tab focus, flipping `isPending`. Gate rendering on `useSettledSession()` (`lib/auth-client.ts`), not `useSession().isPending`, or the workspace remounts.
- Every "day" (check-ins, streaks, daily problem) is a UTC day.
- tRPC uses superjson; the API on :3001 serves `/trpc` and `/api/auth/*`.
- In zsh, an unquoted `$VAR` holding several words is one argument; use arrays.

## Courses

- Content is typed data in `packages/courses` (`types.ts` is the lesson spec). Two formats: `modules` (AI Engineer, linear unlock) and `levels` (System Design, unlock by prerequisites); narrow on `course.format`. Assessment ids are `lesson:<slug>`, `exam:<submodule or level slug>` and `challenge:<slug>`.
- Draws, grading and unlock rules live in `packages/courses/src/assessment.ts`, shared by web and API. The API grades (`courses.submit`) and refuses locked or planned assessments via `assessmentStatus()`; never trust a client score.
- System Design (`thesis/s-design.md`) is built: 24 reviewed lessons, 3 level exams, 8 challenges graded by Gemini (`apps/api/src/services/design/`). Server recomputes scores and never trusts the model's total. Content loads per lesson on demand (`system-design/content.ts`). Tests: `pnpm --filter @hookdrill/api test:design-eval`, `test:design-flow` (needs a `*_test` DATABASE_URL), `eval:calibrate` (needs `GEMINI_API_KEY`; `--stub` checks plumbing only). Dev without a key: `DESIGN_EVAL_STUB=1`.
- Content changes must pass `pnpm --filter @hookdrill/courses check` and get an independent accuracy review before publishing.
- Exam questions may only map to objectives in their own submodule (the checker enforces it).

## Open items (as of 2026-11-02)

- `course_results`, `design_challenges`, `contests` and `practice_rating_backfill` migrations (`packages/db/drizzle/20261028102904_course_results`) is generated but not applied: run `pnpm db:migrate` once Postgres is up.
- `@hookdrill/courses` imports all lesson text eagerly (~177 KB raw), and the library sidebar and banner pull it in. Lazy-load module content before adding modules.
- Exam question `m01-ai-family-tree-x7` really tests a `when-to-use-ai` objective from the other submodule; rewrite it or relax the mapping rule.
- Grading is trusted from the browser (README caveat): practice rating, daily-solve fame and contests (`packages/challenges/src/contests.ts`, finalised lazily on first read after the round) are gameable by design. Test: `pnpm --filter @hookdrill/api test:contests` (needs a `*_test` DATABASE_URL).
- Course passes don't feed rating or fame yet; undecided.
- AI Engineer Modules 01–02 are written and reviewed; 03–19 are roadmap only. React Mastery has no syllabus.
