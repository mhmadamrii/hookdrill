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
user_stats            user_id, score, solved_count, current_streak, best_streak,
                      last_solve_day, last_score_at
```

Indexes: `solves(first_solved_at)` for weekly boards, `user_stats(score desc, last_score_at asc)` for all-time, `submissions(user_id, created_at desc)`.

## Ranking

- **Points:** easy 10, medium 20, hard 40, awarded only for the **first accepted solve** of a challenge. Re-solves and extra submissions earn nothing, so grinding the same challenge doesn't help.
- **Hint penalty:** −15% per hint revealed before the solve, with a floor of 40%.
- **All-time:** `user_stats.score` desc. Ties go to whoever reached it first (`last_score_at`).
- **Weekly:** `SUM(points_awarded)` from `solves` in the current ISO week.
- **Streak:** consecutive days with at least one solve, counted in the user's timezone (stored on the user). Updated in the solve transaction.
- **Changed grading tests:** existing solves are kept and record the version they passed. Optionally mark them "re-verify" and let users resubmit. Points are never removed silently.

Plain Postgres handles this comfortably for a long time. Add caching only if the leaderboard queries actually get slow.

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
2. **Server grading:** public/grading test split, grader, runner image, CI parity checks, then public leaderboards.
3. **Contributors and growth:** a CONTRIBUTING guide for challenges, an optional PR-opening authoring form, DSA challenges through the same grader with a different runner image.

## Decisions (ADR summary)

| #   | Decision                                                                  | Why                                                           |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | Challenge content lives in git, not a CMS                                 | Review, history, CI checks; no admin UI to build              |
| 2   | Public tests run in the browser; hidden grading tests run on the server   | Instant feedback plus a trustworthy ranking                   |
| 3   | API on the VPS next to PostgreSQL; Vercel never connects to the DB        | DB stays private, no serverless connection storms             |
| 4   | Cloudflare DNS-only for Vercel, proxied for `api.`                        | Follows Vercel's guidance; protects and hides the VPS         |
| 5   | Postgres doubles as the job queue (pg-boss)                               | One less service to run                                       |
| 6   | One rootless Podman container per submission, no network, resource limits | Untrusted code on a shared host                               |
| 7   | Points only for the first accepted solve, with a hint penalty             | Rewards solving breadth, not submission spam                  |
| 8   | tRPC on Hono for web → API calls; Better Auth and health stay plain HTTP  | End-to-end types in a TS monorepo, TanStack Query integration |

## Known risks

- **Single VPS:** the API, grader, and DB share one point of failure. Mitigate with off-box backups and a documented rebuild. The first scale step is moving the grader to its own box.
- **Sandpack internals:** see the spike report. CI parity tests catch breakage on upgrades.
- **Browser and server runners can disagree:** Sandpack's hybrid jsdom 16 differs from Vitest's jsdom. Mitigation: CI runs public tests in both, and only the server verdict counts.
- **Hints ship in the client bundle:** the penalty is effectively honor-based until hints are served by the API on reveal. That's acceptable for v1.
