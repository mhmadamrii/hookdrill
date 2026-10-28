# HookDrill architecture

Status: **proposed** (after the spike in [SPIKE_REPORT.md](./SPIKE_REPORT.md)). `<domain>` stands for the production domain.

## Goals

- Practice React/UI (later DSA) challenges with instant in-browser feedback.
- Verdicts that count for ranking are computed **server-side**, so the leaderboard is trustworthy.
- Maintainers add challenges as reviewed code, with automatic checks.
- Runs on what we have: **one VPS** (existing PostgreSQL, Podman) plus **Vercel** for the frontend, with **Cloudflare** as nameserver.

## Core principle

> **Sandpack is for feedback, the server decides.**
> Public tests run in the browser while coding. Hidden grading tests run in an isolated container on submit. Only server verdicts earn points.

## Topology

```
                         Cloudflare (nameserver)
                 ┌───────────────┴────────────────┐
     <domain>, www  (DNS only, grey)     api.<domain>  (proxied, orange)
                 │                                │
                 ▼                                ▼
      Vercel: apps/web                    VPS  ─ firewall + Caddy (existing, on host)
      TanStack Start (SSR + static)            │
      challenge content (public parts)         ├─ apps/api     (Hono + tRPC)  ◄─┐
      Sandpack (editor/preview/public tests)   ├─ apps/grader  (worker)        │ private
                 │                             │    └─ spawns runner containers │ podman
                 │  fetch (credentials)        └─ PostgreSQL (existing) ────────┘ network
                 └──────────────────────────────► api.<domain>
```

- **Browser → Vercel** directly. Vercel's guide recommends against a reverse proxy in front of it: Bot Protection stops working, caches are split, and the client IP is lost.
- **Browser → `api.<domain>`** goes through Cloudflare (DDoS protection, hides the VPS IP, rate limiting). SSL mode **Full (strict)**, with a Cloudflare Origin Certificate on the existing Caddy. Add a site block `api.<domain> { reverse_proxy 127.0.0.1:<api-port> }`. Containers publish ports on `127.0.0.1` only, so Caddy is the sole way in. On the existing firewall, allow 80/443 **only from Cloudflare IP ranges**, and SSH only from your own IPs. Bind to `127.0.0.1` whatever the firewall says: rootful container port publishing inserts its own iptables/nftables rules that can bypass host firewall rules (ufw/firewalld).
- **PostgreSQL is never exposed to the internet.** Only `api` and `grader` reach it, over the private Podman network or localhost. Vercel functions never connect to the DB, which also avoids serverless connection storms and cross-region latency.

## Components

| Component             | Where                 | Tech                                                         | Responsibility                                                                      |
| --------------------- | --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `apps/web`            | Vercel                | TanStack Start, Tailwind, Sandpack                           | UI, challenge pages, public tests in the browser, calls the API                     |
| `apps/api`            | VPS container         | Hono + tRPC, Better Auth, Drizzle                            | Auth, drafts, submissions, leaderboards, rate limits                                |
| `apps/grader`         | VPS container         | Node worker, pg-boss                                         | Takes submission jobs, runs grading in throwaway runner containers, writes verdicts |
| runner image          | VPS (spawned per job) | Node, Vitest, jsdom, RTL, user-event (preinstalled, offline) | Runs one submission against its grading tests                                       |
| `packages/challenges` | repo                  | data only                                                    | Source of truth for challenge content                                               |
| `packages/db`         | repo                  | Drizzle schema + migrations                                  | Shared by api and grader                                                            |
| PostgreSQL            | VPS (existing)        |                                                              | All state, plus the job queue (pg-boss), so no Redis needed                         |

Why Hono for the API instead of TanStack Start server functions: the frontend is on Vercel and the data is on the VPS. A small standalone API next to the DB keeps that boundary explicit, and runs as one Podman container.

## API protocol: tRPC on Hono

The web app and the API are TypeScript in the same monorepo, so **tRPC** gives end-to-end types without writing or generating a schema.

```
api.<domain>/trpc/*       tRPC router (@hono/trpc-server adapter)
api.<domain>/api/auth/*   Better Auth (plain HTTP: OAuth redirects and callbacks need real URLs)
api.<domain>/health       plain GET for uptime checks
```

- **Server:** procedures in `apps/api/src/router/*` (`challenges`, `drafts`, `submissions`, `leaderboard`, `me`).
  - Inputs are validated with zod.
  - `protectedProcedure` middleware reads the Better Auth session from the request cookie.
  - Rate limiting is middleware too.
- **Client:** `apps/web` imports **types only** with `import type { AppRouter } from '@hookdrill/api'`, which is erased at build, so no server code reaches the bundle.
  - It uses `@trpc/tanstack-react-query` with `httpBatchLink({ url: 'https://api.<domain>/trpc', fetch: (u, o) => fetch(u, { ...o, credentials: 'include' }) })`.
  - TanStack Query handles caching, polling submission status, and invalidating after a submit.
- **Non-RPC parts:** the grader is not RPC. It talks to the API only through the database (pg-boss jobs plus rows). Webhooks, if any appear later (GitHub app for authoring PRs), are plain Hono routes.
- **Trade-off accepted:** tRPC is not a public REST API. If third parties ever need one, add REST routes or an OpenAPI layer next to it.
- **Alternatives considered:**
  - Hono's built-in RPC client: fewer packages, but less mature React Query integration.
  - oRPC: also gives OpenAPI, but has a smaller community.

Either can replace tRPC later, because procedures stay thin and call service functions in `apps/api/src/services`.

## Challenge content: stored in git

Each challenge is a folder in `packages/challenges/src/<track>/<slug>/`:

```
meta.ts            id, slug, title, difficulty, track, summary
description.md
hints.ts
starter/           files the user starts with
solution/          reference solution (dev-only on the client, used by CI and the grader self-test)
tests/public/      shipped to the browser, run in Sandpack
tests/grading/     NEVER shipped to the browser, run by the grader
index.ts           assembles the public Challenge (must not import tests/grading or solution)
```

**Maintainer flow: pull request, CI, merge, deploy.**

1. The maintainer opens a PR adding or editing a challenge folder.
2. CI checks:
   - `meta` validates against a zod schema, and the slug is unique.
   - The **solution passes** and the **starter fails** both public and grading tests, under Vitest + jsdom headless. This is the same runner image the grader uses.
   - Sandpack parity: a Playwright run proves the public tests also behave in the browser runner (see the gotchas in [README.md](./README.md)).
   - A bundle check: the built web client contains no `tests/grading` or `solution` code (grep the build output).
3. Merge to `main` deploys everything from the **same commit**:
   - Vercel builds `apps/web`, which includes public content only.
   - CI builds the `api`, `grader`, and `runner` images (the runner image bundles the grading tests) and deploys them to the VPS.
   - `pnpm db:sync-challenges` upserts `challenges` and inserts a `challenge_versions` row whenever the grading tests' hash changes.

If non-developer authors appear later, add an authoring form that opens a PR through the GitHub API. The same checks apply, and there is still no CMS.

## Submission flow

```
user clicks Submit
  → POST api/submissions {challengeId, files}        auth + rate limit (1 per 10 s per user)
  → INSERT submissions(status='queued', version=current)  + enqueue pg-boss job
  → grader picks job → writes files to a temp dir → podman run runner (see Isolation)
  → parse Vitest JSON report → UPDATE submissions(verdict, passed, total, ms, report)
  → if accepted and no prior solve: INSERT solves + UPDATE user_stats (one transaction)
web polls GET api/submissions/:id (or SSE) until it is final
```

"Run tests" (public tests in Sandpack) never touches the server.

## Grader isolation (untrusted code on the same box as the DB)

This is the highest-risk component. Every submission runs in a fresh, disposable container:

```bash
podman run --rm \
  --network=none --read-only --tmpfs /tmp:rw,size=64m \
  --memory=512m --memory-swap=512m --cpus=1 --pids-limit=128 \
  --cap-drop=ALL --security-opt=no-new-privileges \
  --user 65534:65534 --timeout=30 \
  -v "$JOB_DIR:/work:ro" \
  hookdrill-runner:<commit>
```

- The grader runs **rootless** Podman under a dedicated Unix user that has no DB credentials on disk. The grader process holds the credentials; runner containers get nothing.
- Concurrency is capped (start at `2`, tune to the VPS's CPU count). Overflow waits in the queue.
- Hardening options, in order:
  1. `--runtime=runsc` (gVisor) to put a user-space kernel between user code and the host.
  2. Move the grader to a second small VPS, so a container escape can't reach PostgreSQL.
- The output is trusted only after parsing as JSON within a size limit. Anything else becomes the verdict `error`.

## Data model (Drizzle, sketch)

```
users                 id, handle, email, created_at                  (Better Auth tables alongside)
challenges            id, slug, track, difficulty, points, current_version, published_at
challenge_versions    challenge_id, version, tests_hash, published_at          PK(challenge_id, version)
drafts                user_id, challenge_id, files jsonb, updated_at          PK(user_id, challenge_id)
submissions           id, user_id, challenge_id, version, files jsonb,
                      status (queued|running|done), verdict (accepted|failed|error|timeout),
                      passed, total, duration_ms, report jsonb, created_at
hint_reveals          user_id, challenge_id, hint_index, revealed_at          PK(user_id, challenge_id, hint_index)
solves                user_id, challenge_id, submission_id, version, hints_used,
                      points_awarded, first_solved_at                          PK(user_id, challenge_id)
user_stats            user_id, rating, fame, solved_count, current_streak, best_streak,
                      last_checkin_day, last_rating_at
daily_problems        day (UTC date) PK, challenge_id                          scheduled or auto-filled
checkins              user_id, day                                             PK(user_id, day)
fame_events           id, user_id, kind (checkin|daily_solve|contest), day,
                      amount, ref, created_at                                  unique(user_id, kind, day, ref)
contests              id, slug, title, starts_at, ends_at,
                      status (scheduled|live|ended|final), rated
contest_problems      contest_id, challenge_id, label (A–D), points            PK(contest_id, challenge_id)
contest_registrations contest_id, user_id, registered_at                      PK(contest_id, user_id)
contest_results       contest_id, user_id, solved, penalty_min, rank,
                      rating_awarded, fame_awarded                             PK(contest_id, user_id)
```

Indexes: `user_stats(rating desc, last_rating_at asc)` and `user_stats(fame desc)` for all-time boards, `fame_events(day)` and `solves(first_solved_at)` for monthly boards, `submissions(user_id, created_at desc)`.

## Ranking

Two numbers, measuring different things. Neither ever goes down. There is no country or region grouping anywhere.

**Day boundary:** every "day" (check-in, daily problem, streak) is a **UTC** date computed on the server. One global daily problem, and nothing to gain by changing time zones.

### Rating: skill

Earned only from **server verdicts**.

- **Practice:** easy 10, medium 20, hard 40, awarded only for the **first accepted solve** of a challenge. Re-solves and extra submissions earn nothing, so repeating a challenge doesn't help.
- **Hint penalty:** −15% per hint revealed before the solve, with a floor of 40%.
- **Contests:** see [Contests](#contests). They are worth more than practice.
- Rating tiers are milestones on this number (the colours in the UI), not a skill estimate that can drop.

### Fame: showing up

An append-only ledger (`fame_events`), with `user_stats.fame` as its running total.

| Event                  | Fame                             | Rule                                                                                                            |
| ---------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Daily check-in         | +10                              | Explicit "Check in" button, once per UTC day                                                                    |
| Streak bonus           | +2 per prior streak day, max +20 | Added to the check-in. The streak is consecutive check-in days                                                  |
| Solve today's problem  | +50                              | Server-accepted submission on that day's problem, during that day. Counts even if solved before (unlike rating) |
| Take part in a contest | +30                              | At least one submission in a rated contest                                                                      |

- **Daily problem:** comes from the server (`daily_problems`). Maintainers can schedule a day; otherwise the first request of the day picks the challenge used least recently (never used first, then book order) and stores it. The web banner reads it from the API.
- The check-in and each award happen in one transaction. The unique key on `fame_events` makes every award idempotent.

### Boards

- **Rating, all-time:** `user_stats.rating` desc. Ties go to whoever reached it first (`last_rating_at`).
- **Fame, all-time and this month:** monthly is `SUM(amount)` from `fame_events` in the current UTC month, so newcomers can top it.
- **Changed grading tests:** existing solves are kept and record the version they passed. Optionally mark them "re-verify" and let users resubmit. Points are never removed silently.

Plain Postgres handles this comfortably for a long time. Add caching only if the leaderboard queries actually get slow.

## Contests

Timed rounds, 90 minutes, usually four problems (A easy, B and C medium, D hard).

### How a contest problem is made

Problem content is public in git and ships to the browser, so contest problems can't live there before the round.

1. **Write:** a maintainer authors the problem in a private `hookdrill-contests` repo, with the same folder layout as `packages/challenges` plus grading tests.
2. **Test:** a second maintainer solves it blind, as the tester. CI checks that the starter fails, the solution passes, the grading tests are deterministic, and the problem runs within the time limit.
3. **Schedule:** an admin creates the contest: problems, labels, points (for example 20/30/40/60) and start/end times. A sync step loads the problems into the DB, never into the web bundle.
4. **Publish:** after the round, a PR moves the problems into `packages/challenges`, and they become practice problems for upsolving. Practice solves of former contest problems earn the normal practice rating.

### Lifecycle

```
scheduled → registration open → live → ended → final
```

- **live:** the API serves problem statements only between `starts_at` and `ends_at`, and only to registered users. Every Submit goes to the grader. Only pass/fail counts are shown, never test names.
- **Standings (ICPC):** ranked by problems solved, then by penalty: the sum of minutes to each accept, plus 5 minutes per rejected submission before it. Rejections on problems never solved cost nothing.
- **ended → final:** after a review window, flagged submissions are checked by hand, then the results freeze.
  - A similarity check across submissions flags near-duplicates.
  - Rated rounds forbid AI assistance. We can't technically enforce that, so the rule is stated and the review step backs it up.
- **On final**, in one transaction per contest:
  - **Rating:** sum of points for solved problems × a placement multiplier (top 10% ×1.5, top 25% ×1.25, else ×1.0). It is written to `contest_results.rating_awarded`.
  - **Fame:** +30 for taking part.

Only registered users who submitted at least once appear in the results.

## Courses

Structured paths: **course → phase → module → submodule → lesson**. Two courses for now: AI Engineer (Module 01 published, the rest listed as in development) and React Mastery (announced, no syllabus).

- **Content** lives in `packages/courses` as typed data, reviewed in PRs like challenges. The schema (`types.ts`) is the lesson specification: objectives, concept sections (intuition first), a real-world application, misconceptions, a question bank, references and a review date. Each lesson is labelled `foundational`, `current-practice` or `emerging` so reviewers know what ages first. How content is sourced and verified: `packages/courses/CONTENT.md`.
- **Assessments:** a lesson quiz draws 6 of its 8 questions; a submodule exam draws 15 from every lesson's bank plus exam-only cumulative questions. Draws go round-robin across learning objectives, so a paper never skips one while it has room. Options are shuffled. Pass mark 80%.
- **Progression:** a submodule opens when the previous exam is passed; its lessons open in any order; its exam opens when every lesson quiz is passed. Passing is permanent.
- **Grading is on the server** (`courses.submit`), which also enforces the unlock rules. `course_results` keeps one row per user per assessment: attempts, best score, `passed_at`. Course results don't feed rating or fame yet.
- **Signed out:** the first submodule is readable; quizzes ask you to sign in.
- **Routes:** `/courses` and `/courses/$course` sit in the `(library)` group with the library sidebar; lessons (`/courses/$course/$lesson`) and exams (`/courses/$course/exam/$submodule`) sit in the `(course)` group, whose layout shows the course outline. `/explore` redirects to `/courses`.

## Auth and sessions

- Better Auth in `apps/api` with the Drizzle adapter. Start with GitHub OAuth (the audience is developers), then add email.
- The session cookie is set by `api.<domain>` with `Domain=<domain>`, `Secure`, `HttpOnly`, `SameSite=Lax`. Web and API are same-site, so cookies work for browser fetches. SSR on Vercel can forward the cookie to the API when it needs user data.
- CORS on the API allows only `https://<domain>`, with credentials.

## Deployment

- **Vercel:** Git integration on `apps/web`, using the TanStack Start Nitro preset per the TanStack hosting docs. Preview deploys per PR point at a staging API (or a read-only mode).
- **VPS:** CI builds the images and pushes them to GHCR. The deploy step runs SSH, `podman pull`, then a restart.
  - Services are defined as **Podman Quadlet** units (`.container` files managed by systemd): `api`, `grader`. Caddy stays the existing host install; add the `api.<domain>` site block.
  - The `hookdrill-runner` image is pulled but never runs as a service.
- **Migrations:** `drizzle-kit migrate` runs as a one-shot step before `api` restarts.
- **Backups:** a nightly `pg_dump` copied **off the VPS** (object storage). Test a restore once.
- **Observability:** container logs go to journald. Add an uptime check on `api.<domain>/health`. Watch the queue depth and grader timeouts.

## Repo layout (target)

```
apps/web            existing
apps/api            new: Hono + tRPC + Better Auth (exports type AppRouter)
apps/grader         new: pg-boss worker + runner Containerfile
packages/challenges existing: add tests/public + tests/grading split
packages/db         new: Drizzle schema, migrations, sync-challenges script
deploy/             Quadlet units, Caddy site snippet for api.<domain>
```

## Phases

1. **Accounts + progress:** API, DB, auth, saved drafts, solved ticks graded in the browser shown only on your own profile. No public leaderboard.
   - **1b. Fame without grading:** server-side daily problem, the check-in button, check-in and streak fame, and a real Fame leaderboard. None of it depends on test results, so it can't be faked by reporting a pass.
2. **Server grading:** public/grading test split, grader, runner image, CI parity checks. Then rating, the daily-solve fame bonus and the Rating leaderboard.
3. **Contests:** private contest repo, admin scheduling, the live round, standings, finalisation.
4. **Contributors and growth:** a CONTRIBUTING guide for challenges, an optional PR-opening authoring form, DSA challenges through the same grader with a different runner image.

## Decisions (ADR summary)

| #   | Decision                                                                                                                      | Why                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | Challenge content lives in git, not a CMS                                                                                     | Review, history, CI checks; no admin UI to build                                           |
| 2   | Public tests run in the browser; hidden grading tests run on the server                                                       | Instant feedback plus a trustworthy ranking                                                |
| 3   | API on the VPS next to PostgreSQL; Vercel never connects to the DB                                                            | DB stays private, no serverless connection storms                                          |
| 4   | Cloudflare DNS-only for Vercel, proxied for `api.`                                                                            | Follows Vercel's guidance; protects and hides the VPS                                      |
| 5   | Postgres doubles as the job queue (pg-boss)                                                                                   | One less service to run                                                                    |
| 6   | One rootless Podman container per submission, no network, resource limits                                                     | Untrusted code on a shared host                                                            |
| 7   | Points only for the first accepted solve, with a hint penalty                                                                 | Rewards solving breadth, not submission spam                                               |
| 8   | tRPC on Hono for web → API calls; Better Auth and health stay plain HTTP                                                      | End-to-end types in a TS monorepo, TanStack Query integration                              |
| 9   | Two scores: rating (skill, from solves and contests) and fame (consistency, from check-ins and daily solves); both only go up | Separates "good" from "shows up"; additive points stay stable with few players, unlike Elo |
| 10  | One UTC day for everyone                                                                                                      | One global daily problem; no time-zone gaming of check-ins                                 |
| 11  | Contest problems are private until the round, then become practice                                                            | Public content in git can't be secret; upsolving reuses them                               |

## Known risks

- **Single VPS:** the API, grader, and DB share one point of failure. Mitigate with off-box backups and a documented rebuild. The first scale step is moving the grader to its own box.
- **Sandpack internals:** see the spike report. CI parity tests catch breakage on upgrades.
- **Browser and server runners can disagree:** Sandpack's hybrid jsdom 16 differs from Vitest's jsdom. Mitigation: CI runs public tests in both, and only the server verdict counts.
- **Hints ship in the client bundle:** the penalty is effectively honor-based until hints are served by the API on reveal. That's acceptable for v1.
