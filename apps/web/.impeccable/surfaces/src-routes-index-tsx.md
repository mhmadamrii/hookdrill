---
version: 1
slug: "src-routes-index-tsx"
primary_target: "src/routes/index.tsx"
related_targets: ["src/routes"]
---

# Surface brief: HookDrill app + landing (redesign)

Scope: replaces the Étude Edition world across apps/web. Surfaces:
- Landing `/` (Persuade).
- Operate pages: problems list, problem workspace, dashboard, explore/tracks, contests, leaderboard, profile, sign-in, 404.

Audience: working developers staying sharp and interview grinders. Peers that set the bar: LeetCode, HackerRank, Codeforces (user's standing preference, PRODUCT.md). The look must be their equal in craft without copying their trademarks.

Constraints:
- Light and dark mode. Defaults to the system setting, with a toggle that persists.
- Only Todo List and Playlist Builder are playable. Every other problem, contest, player and score is sample data, labeled as such.
- Server grading isn't live yet, so "Submit" runs the public tests and records progress honestly.

## Direction contract

THESIS: A competitive-programming-grade practice platform for real UI work. It is dense, fast and dark-first, and makes React components feel as drillable as LeetCode problems. It refuses the editorial, paper and music-book look of the previous world, and arcade gamification (confetti, XP bars).

OWN-WORLD:
- Dark (after the user's LeetCode references): neutral graphite ground #1a1a1a with panels #262626 / #303030, borders #353535, text #eff1f6. Workspace panels float with 8px gaps.
- Light: #f7f8fa ground on white panels.
- One brand accent, HookDrill blue-violet #5b6cff, for primary actions and focus.
- Difficulty in the category's convention: easy teal #00b8a3, medium amber #ffb800, hard rose #ff375f. Accepted green #2cbb5d, wrong red #ef4743.
- Inter for UI with tabular numerals; JetBrains Mono for code. Rounded-lg panels, 1px borders, no gradients-as-decoration, no glow.

STORY:
- A visitor lands, sees the actual workspace with a component and its passing tests, and starts a problem in one click.
- A member opens the dashboard, picks up where they left off, sees streak, solved counts by difficulty, contests and rank, and goes back to drilling.

FIRST VIEWPORT:
- Landing: a top nav (logo; Problems, Explore, Contests, Leaderboard; Sign in and a primary "Start practicing"). Left is a headline about hand-writing UI without AI plus two CTAs. Right is a live-looking workspace mock: problem tab, code editor, preview, and a green "6/6 tests passed" console.
- App: a 56px top nav. The problems page has a filter bar over a dense sortable table (status, title, acceptance, difficulty, tags), and a right column with a streak calendar and daily problem.

SIGNATURE MOVE: the test console. Every test result renders as a row of pass/fail cells, the HookDrill "test strip". It appears in the workspace console, submission results, the landing hero, and recent activity on the dashboard.

FORM: The category standard (canon), user-pinned. Peers: LeetCode, HackerRank, Codeforces. No concept seed; the user's brief pins it.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
