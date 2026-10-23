# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two primary audiences, weighted equally:

- **Working developers staying sharp.** They rely on AI agents day to day and want to keep their hand-coding fundamentals (React hooks, state, DOM behaviour, later DSA) from rusting. Short, deliberate sessions.
- **Job seekers preparing for interviews.** Juniors and mid-level developers grinding challenges before technical interviews. For them, rankings, streaks, and visible progress matter.

Neither group should feel the product is aimed at the other. Secondary audience: **maintainers**, who author challenges as pull requests (see `ARCHITECTURE.md`).

## Product Purpose

A practice platform where you solve coding challenges by hand. You build real React/UI components in the browser and see them live; later there will also be DSA problems. Success means a user can open a challenge, read the requirements, write the code, watch it work, run tests, submit, and see their progress and ranking change.

## Positioning

Two things combined, and a neighbouring product would not truthfully claim both:

1. **Real UI, real tests.** Challenges are working components verified by hidden React Testing Library + user-event suites. They are not only algorithm puzzles, and they are not judged by matching a screenshot.
2. **Deliberate practice without AI.** Training without autocomplete or copilots. The drill is the point: repetition that keeps fundamentals alive in the age of AI agents.

## Operating Context

- **Workspace:** a desktop, two-column layout. The problem statement and hints on one side; the code editor, live preview, and test results on the other. Mostly keyboard work, with long focus sessions.
- **Loop:** read the requirements, reveal hints one at a time if stuck, edit `App.jsx` (some challenges have more than one file), watch the live preview, run the public tests (in the browser, instant), then submit (graded on the server, counts for ranking).
- **Progress:** first accepted solves earn points by difficulty (easy 10, medium 20, hard 40), minus a hint penalty. There are all-time and weekly leaderboards and daily streaks.
- **Sign-in:** GitHub OAuth first; the audience is developers.

## Capabilities and Constraints

- Challenges are **data**: each one lives in its own folder in `packages/challenges` with metadata, a markdown description, hints, starter code, a solution, and tests. Adding one never changes UI code.
- **Selectors are a contract.** Each challenge publishes the `data-testid` values its tests use, and the description must list them.
- In-browser execution and preview use Sandpack. Sandpack is used only inside `src/features/challenge-workspace`.
- **Built:** challenge list, challenge workspace (Todo List, Playlist Builder), public tests in the browser.
- **Planned** (`ARCHITECTURE.md`): accounts, saved drafts, server-graded submissions, leaderboards, profiles and streaks, DSA challenges.
- **Terminology:** challenge, track (react, dsa), difficulty (easy, medium, hard), hint, starter, public tests, grading tests, submission, verdict (accepted, failed, error, timeout), solve, points, streak.
- **Undecided:** the timing of the public leaderboard relative to launch (phase 1 vs phase 2), monetisation, and DSA languages.

## Brand Commitments

Name: **HookDrill**. No logo, palette, typography, or voice is committed yet.

## Evidence on Hand

- Two real challenges with descriptions, hints, starters, solutions, and tests: `packages/challenges/src/react/todo-list`, `packages/challenges/src/react/playlist-builder`.
- Spike findings: `SPIKE_REPORT.md`. Target architecture: `ARCHITECTURE.md`.
- No users, testimonials, usage statistics, or press yet. Do not invent any (no fake leaderboard names presented as real, no user counts).

## Product Principles

1. **The workspace is the product.** Every decision serves the focus loop: read, code, see, test.
2. **Honest verdicts.** Only server-graded results earn points, and the UI never implies otherwise.
3. **Earned progress, not noise.** Rankings and streaks reward breadth of first solves, not volume of submissions.
4. **Fundamentals over shortcuts.** Hints are graduated and cost something. The product never offers to write the code for you.
5. **Serve both audiences.** Calm enough for a senior engineer's twenty-minute drill, motivating enough for an interview grinder.

## Accessibility & Inclusion

No product-specific standard has been set beyond WCAG AA as a baseline. The workspace is keyboard-heavy, so focus visibility and keyboard reachability of every control (hints, run, submit, reset) matter.
