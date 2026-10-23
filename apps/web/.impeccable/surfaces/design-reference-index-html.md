---
version: 1
slug: "design-reference-index-html"
primary_target: "design/reference/index.html"
related_targets: []
---

# Surface brief: UI reference set

Scope: static reference pages for every planned HookDrill app screen (challenge index, workspace with states, submission verdicts, rankings, profile/practice record, sign in, first run, empty profile, 404). Mode: **Operate**. Built code-first. These pages are the target that apps/web implements later.

Audience and job: working developers and interview grinders. Pick a challenge, read the requirements, code by hand, run public tests, submit for a server verdict, and see points, streak, and rank change.

Constraints: real challenge content for Op. 1 and Op. 2. All other entries, users, and scores are synthetic and labeled as samples. No gamified arcade devices (no confetti, XP bars, badge walls). Standard web controls only.

Unresolved: the timing of the public leaderboard (phase 1 vs phase 2). The rankings page carries a "verified by server grading" note.

## Direction contract

THESIS: HookDrill is a graded étude edition. Each challenge is a numbered study (Op. 1, Op. 2…) in a book per track, and practising it by hand is the point. It refuses the category default: a grey LeetCode table, dark IDE chrome with a neon accent, and arcade gamification.

OWN-WORLD: The shell is edition-cover blue cloth (#2f557f), with the active book darker. Content sits on bright engraving-white paper (#f8f9fa, never cream) in near-black ink, with hairline engraved rules and no cards or shadows. Schirmer yellow (#e0a526) is reserved for the single next action. Teacher's red pencil (#c63d2f) marks failures, and pass green (#2e7d5b) marks server-accepted solves. The type is a firm grotesk with tabular figures, JetBrains Mono only for code, and right-aligned figures against the margin.

STORY: The visitor sees their place in the book, resumes the étude marked in yellow, and reads requirements each paired with the test that proves it. They run the public tests (instant), submit for a server verdict, and watch the barline close.

FIRST VIEWPORT: Left is a 248px blue rail: brand, Book I · React (active), Book II · DSA (soon), then Practice record, Rankings, Write an étude, and the user with streak and points at the foot. Main: the heading "Book I · Études" at 56px with a one-line progress summary to its right; difficulty filter chips plus search; a dense index table with No. (Op. n), the étude title with a line of detail, difficulty as graded ticks, points right-aligned, and Record as a barline glyph. The in-practice row carries a yellow Resume action.

SIGNATURE MOVE: Progress is notated as barlines. A single thin bar is not played, a repeat sign is in practice, and a thin+thick final barline is solved by server verdict. It appears in the index, the profile practice record, and the submission verdict (the final barline draws closed on accept).

FORM: Étude Edition (graded étude collections: Czerny, Hanon, Henle Urtext, Schirmer). Assigned candidate 7 of 7 on the grounded list; seed key 1a84f03c.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
