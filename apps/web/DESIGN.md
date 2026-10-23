---
name: HookDrill
description: A graded étude edition for hand-written React practice. Cover-cloth shell, engraving paper, barline notation.
colors:
  cover: '#2f557f'
  cover-deep: '#24466b'
  cover-line: '#46698f'
  on-cover: '#ffffff'
  on-cover-2: '#c9d7e6'
  paper: '#f8f9fa'
  sheet: '#ffffff'
  ink: '#15171c'
  ink-2: '#474d57'
  mute: '#646b76'
  rule: '#d8dce1'
  rule-soft: '#e9ecef'
  cover-soft: '#e8eef5'
  next: '#e0a526'
  next-deep: '#c38c14'
  next-soft: '#fbf1db'
  fail: '#c63d2f'
  fail-soft: '#fbecea'
  pass: '#2e7d5b'
  pass-soft: '#e6f2ec'
  graphite: '#5d636c'
  code-key: '#2f557f'
  code-str: '#8a5a12'
  code-fn: '#7a3b8f'
  code-com: '#7b828c'
typography:
  display:
    fontFamily: 'Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(3.5rem, 6vw, 5.75rem)'
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: '-0.04em'
  headline:
    fontFamily: 'Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif'
    fontSize: '3.5rem'
    fontWeight: 800
    lineHeight: 1
    letterSpacing: '-0.03em'
  headline-sm:
    fontFamily: 'Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif'
    fontSize: '2.25rem'
    fontWeight: 800
    lineHeight: 1
    letterSpacing: '-0.03em'
  title:
    fontFamily: 'Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.625rem'
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: '-0.02em'
  title-sm:
    fontFamily: 'Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.25rem'
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: '-0.01em'
  body:
    fontFamily: 'Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.0625rem'
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: 'Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.9375rem'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.8125rem'
    fontWeight: 500
    lineHeight: 1.4
  label-column:
    fontFamily: 'Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.8125rem'
    fontWeight: 500
    lineHeight: 1
    letterSpacing: '0.06em'
  figure:
    fontFamily: 'Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.0625rem'
    fontWeight: 700
    lineHeight: 1.5
    fontFeature: '"tnum" 1'
  code:
    fontFamily: 'JetBrains Mono, ui-monospace, SF Mono, Menlo, monospace'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.7
    fontFeature: '"liga" 0, "calt" 0'
rounded:
  sm: '4px'
  md: '6px'
  pill: '999px'
  round: '50%'
spacing:
  hair: '4px'
  xs: '8px'
  sm: '12px'
  md: '16px'
  lg: '24px'
  gutter: '28px'
  section: '56px'
components:
  button:
    backgroundColor: '{colors.sheet}'
    textColor: '{colors.ink}'
    typography: '{typography.body-sm}'
    rounded: '{rounded.md}'
    padding: '0 16px'
    height: '38px'
  button-lg:
    rounded: '{rounded.md}'
    typography: '{typography.body}'
    padding: '0 22px'
    height: '48px'
  button-next:
    backgroundColor: '{colors.next}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '0 16px'
    height: '38px'
  button-next-hover:
    backgroundColor: '{colors.next-deep}'
    textColor: '{colors.ink}'
  button-ink:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.sheet}'
    rounded: '{rounded.md}'
    padding: '0 16px'
    height: '38px'
  button-ghost:
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '0 16px'
    height: '38px'
  button-ghost-hover:
    backgroundColor: '{colors.rule-soft}'
  button-disabled:
    backgroundColor: '{colors.rule-soft}'
    textColor: '{colors.mute}'
  chip:
    backgroundColor: '{colors.sheet}'
    textColor: '{colors.ink}'
    typography: '{typography.body-sm}'
    rounded: '{rounded.pill}'
    padding: '8px 14px'
  chip-selected:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.sheet}'
    rounded: '{rounded.pill}'
  field:
    backgroundColor: '{colors.sheet}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '0 12px'
    height: '40px'
  tab:
    textColor: '{colors.mute}'
    typography: '{typography.body-sm}'
    padding: '12px 14px 11px'
  tab-selected:
    textColor: '{colors.ink}'
  rail:
    backgroundColor: '{colors.cover}'
    textColor: '{colors.on-cover}'
    width: '248px'
  rail-item:
    textColor: '{colors.on-cover-2}'
    typography: '{typography.body-sm}'
    padding: '10px 28px'
  rail-item-active:
    backgroundColor: '{colors.cover-deep}'
    textColor: '{colors.on-cover}'
  coverbar:
    backgroundColor: '{colors.cover}'
    textColor: '{colors.on-cover}'
    height: '56px'
    padding: '0 20px'
  index-row-current:
    backgroundColor: '{colors.next-soft}'
  ruled-row-me:
    backgroundColor: '{colors.cover-soft}'
  verdict-word-pass:
    textColor: '{colors.pass}'
    typography: '{typography.headline}'
  verdict-word-fail:
    textColor: '{colors.fail}'
    typography: '{typography.headline}'
  error-well:
    backgroundColor: '{colors.fail-soft}'
    rounded: '{rounded.md}'
    padding: '10px 12px'
---

# Design System: HookDrill

## Overview

**Creative North Star: "The Étude Edition"**

HookDrill is printed as a graded collection of studies, in the lineage of Czerny, Hanon, Henle Urtext and Schirmer. Each challenge is an opus number in a book per track. The shell is the edition's blue cover cloth; the content is bright engraving paper set in near-black ink, divided by hairline engraved rules. Nothing floats. Hierarchy comes from heavy grotesk headings, a 2px ink underline beneath each page heading, and figures set right against the margin.

Density is a working reference book's density: tables are the primary form, rows are 14 to 16px tall in padding, and the only wash of colour in a list is the row that holds the user's next action. Colour is semantic and scarce. Schirmer yellow marks the one thing to do next, teacher's red pencil marks failure, green appears only when the server has graded a solve, and everything in between is graphite.

The signature is barline notation. Progress through an étude is written the way a score ends a passage: an open thin bar when unplayed, a repeat sign when in practice, and a thin+thick final barline in green when the server has accepted the solve. The system's single authored motion is the final barline rising closed on an accepted verdict.

**Key Characteristics:**

- Blue cover-cloth rail or bar framing a paper content area, never a dark IDE shell.
- Hairline rules and tables instead of cards, panels or shadows.
- One yellow next action per screen; green reserved for server verdicts.
- Barline glyphs as the progress vocabulary in index, record and verdict.
- Firm variable grotesk at heavy weights; JetBrains Mono only for code.

## Colors

A cloth-and-paper palette: one structural blue, a white-paper neutral ramp in cool greys, and four semantic voices used sparingly.

### Primary

- **Edition Cover Blue** (cover): the rail, the workspace coverbar, the sign-in cover, opus numbers ("Op. 2") in the index and problem meta, the book name in page headings, the focus ring, the caret, and the editor's keyword colour.
- **Active Book Blue** (cover-deep): the active and hovered rail item; the darker spine of the book you are in.
- **Cover Rule** (cover-line): hairlines drawn on the cloth, and the open barline on the coverbar.
- **On-Cover White / On-Cover Mist** (on-cover, on-cover-2): primary and secondary text on cloth.

### Secondary

- **Schirmer Yellow** (next): the single next action on a screen: Resume, Run tests, Submit, Next étude, Start Op. 1. Hover deepens to next-deep. Its pale wash (next-soft) tints only the index row that holds that action.

### Tertiary

- **Teacher's Red Pencil** (fail): failed tests, failed and errored verdicts, hint deductions. Its wash (fail-soft) backs error output wells and the sign-in alert, with a deep red text on top.
- **Server Green** (pass): server-accepted verdict words, the final barline, solved measures in the practice record, and the "verified by server grading" note. Its wash (pass-soft) is defined but not yet used on a shipped surface.
- **Graphite** (graphite): in-browser public test passes, requirement marks, pending/grading states, hint headers. It is the honest neutral between failure and a graded pass.

### Neutral

- **Engraving Paper** (paper): page background. Bright and cool, never cream.
- **Sheet** (sheet): the work column, buttons, chips and fields sitting on paper.
- **Ink / Ink Secondary / Mute** (ink, ink-2, mute): headings and body; supporting copy; metadata, column heads and placeholders.
- **Rule / Soft Rule** (rule, rule-soft): hairline dividers and control borders; secondary dividers, disabled fills, selected file tabs, inline code backgrounds.
- **Selection Tint** (cover-soft): text selection and the "you" row in rankings.
- **Code voices** (code-key, code-str, code-fn, code-com): keyword, string, function and italic comment in the editor, on white.

### Named Rules

**The One Next Action Rule.** Schirmer yellow appears on exactly one control per screen: the action the user should take next. The index row that contains that action may carry the next-soft wash; nothing else may be yellow.

**The Honest Green Rule.** Green means "the server graded this and accepted it". In-browser public test passes are graphite, never green, so no screen implies points before a verdict.

**The You Tint Rule.** cover-soft marks "you" and selection: the current user's rankings row and the text selection colour. Do not use it as a generic highlight.

## Typography

**Display Font:** Schibsted Grotesk (variable 400–900, normal and italic, self-hosted; with ui-sans-serif, system-ui)
**Body Font:** Schibsted Grotesk
**Label/Mono Font:** JetBrains Mono (variable 400–700, self-hosted; with ui-monospace, SF Mono, Menlo), code only

**Character:** A firm, slightly condensed newsroom grotesk set heavy and tight for headings, with a quiet regular weight for body. Mono is a separate instrument, reserved for what the user types.

### Hierarchy

- **Display** (900, clamp(3.5rem, 6vw, 5.75rem), 0.92): the edition title on the sign-in cover only.
- **Headline** (800, 3.5rem, 1, -0.03em): page headings and the verdict word. Drops to 2.5rem under 900px.
- **Headline Small** (800, 2.25rem): workspace problem title, empty-state headings, sign-in form heading.
- **Title** (800, 1.625rem, 1.15, -0.02em): section headings.
- **Title Small** (700, 1.25rem, -0.01em): étude titles in the index, subsection heads, ledger total.
- **Body** (400, 1.0625rem, 1.5): default copy.
- **Body Small** (400, 0.9375rem, 1.6): problem statement and requirements (max 62ch), table cells, controls.
- **Label** (500, 0.8125rem): metadata, timings, legends, notes.
- **Column Label** (500, 0.8125rem, 0.06em, uppercase): table column headers only.
- **Figure** (700–800, tabular): points, positions and counts in data columns, right-aligned.
- **Code** (JetBrains Mono 400, 0.875rem, 1.7; inline at 0.86em): editor, inline code, error output, file tabs.

### Named Rules

**The Plain Integer Rule.** Tabular figures apply only to cells holding a bare integer (points, positions, counts). Mixed text such as "9 / 9", "1.4 s" or prose keeps proportional figures.

**The Typed Characters Rule.** All code renders with ligatures off (`font-variant-ligatures: none`). The user sees exactly the characters they typed.

**The Heading Stands Alone Rule.** Headings carry their own weight. Never put a kicker or eyebrow label above a heading; uppercase tracking is for table column heads only.

## Layout

The app shell is a two-column grid: a fixed 248px cover-blue rail (sticky, full height) and a fluid main column padded 44px top, 56px sides, 72px bottom, with content capped at 1120px. Every page opens with a page head: the headline on the left, a one-line right-aligned summary on the right, closed by a 2px ink rule. Sections are separated by 56px.

The workspace replaces the rail with a 56px coverbar (brand, breadcrumb with a barline, user) and splits into a problem column (min 360px, 34%) on paper and a work column on sheet. The work column stacks an action bar, the editor (1.25fr) and a lower row of preview and tests (1fr), each pane headed by a 10px/16px header with a hairline beneath.

Rhythm runs on 4px steps: 8 and 12px gaps inside controls, 16px row padding, 24px between blocks, 28px rail insets, 56px between sections and column gutters.

At 900px and below, a single breakpoint, the rail becomes a top bar with horizontally scrolling nav, the grid is top-aligned (`align-content: start`), the main padding falls to 28px/16px, and tables reflow: index rows become three-line grids, low-priority columns hide. The workspace stacks problem then work, with sticky mobile tabs and a sticky action bar whose buttons share the width.

## Elevation & Depth

The system is flat. Depth is printed, not lifted: paper against cloth, sheet against paper, and hairline rules (1px rule; 2px ink for page heads and ledger totals). There is no elevation shadow anywhere.

`box-shadow` appears only as a drawing tool, never as depth: a 3px cover-tinted focus ring on fields, horizontal bleeds that extend a row wash past the table edge, and an inset 1.5px ring marking a practised-but-unsolved day in the practice diary.

### Named Rules

**The Engraved Rule Rule.** Separate content with hairline rules, not cards or shadows. If something needs grouping, draw a rule or use a table.

## Shapes

Corners are barely softened: 6px on buttons, fields, select, error wells and alerts; 4px on focus outlines; 3px on inline code. Chips and the reference state switcher are full pills. Avatars are circles. Barlines, grade ticks and diary cells are near-square (0.5–2px). Rows and sections have no corners at all because they have no boxes. The sign-in cover's title panel is the only framed rectangle: a 1px on-cover-2 border on cloth, like a cover label.

## Components

### Buttons

Quiet and firm; colour only when it means something.

- **Shape:** gently squared (6px), 38px tall, 16px sides; large 48px tall, 22px sides.
- **Default:** sheet fill, ink label, 1px rule border, 600 weight. Hover darkens the border to ink-2 (160ms ease-out).
- **Next:** Schirmer yellow fill and border with ink text; hover goes to next-deep. One per screen.
- **Ink:** ink fill, white text; used for sign-in and "clear search" type resets.
- **Ghost:** transparent; hover fills rule-soft. Used for Reset in the workspace action bar.
- **Disabled:** rule-soft fill, mute text, not-allowed cursor.
- Keyboard hints sit inside the label in mono at 70% opacity.

### Chips

- **Style:** pill, sheet fill, 1px rule border, 500 weight body-small, 8px/14px.
- **State:** pressed chips invert to ink fill with white text. Used for difficulty filters.

### Cards / Containers

There are no cards. Content sits directly on paper between rules. The only tinted containers are error output wells (fail-soft, 6px, deep red mono text) and the sign-in alert.

### Inputs / Fields

- **Style:** 40px, sheet fill, 1px rule border, 6px, leading 18px stroke icon in mute.
- **Focus:** border turns cover blue with a 3px cover ring at 15% opacity.
- Selects match: 38px, rule border, 6px.

### Navigation

- **Rail:** brand (800, 1.375rem) with a mist subtitle; book items with an item count; hairline on cloth; secondary links; user with streak and points pinned at the foot. Active and hover: cover-deep fill, white text. Focus outlines turn white on cloth.
- **Tabs:** 600 body-small in mute with a 2px transparent underline; selected turns ink with an ink underline over a 1px rule.
- **Coverbar** (workspace): 56px cloth bar with breadcrumbs in mist, current étude in white, and the étude's barline drawn in white.

### Étude Index (signature)

The challenge list is a ruled table: opus number in cover blue (700), title (700, 1.25rem) with a mute detail line, difficulty as three graded ticks (6x14px, ink when on), points as right-aligned tabular figures, and Record as a barline. The in-practice row carries the next-soft wash bled 16px past both edges, and the yellow Resume button sits beside its title. A legend below the table explains the three barlines.

### Barline (signature)

- **Open** (thin bar in mute): not played.
- **Repeat** (thick bar, thin bar, two dots, in ink): in practice.
- **Final** (thin + thick bar in pass green): solved by server verdict.
- Sizes: 16px (inline), 28px (default), 64px (verdict). On cloth it draws in white with an open bar in cover-line.
- **Motion:** on an accepted verdict the final barline rises from 8% to full height over 700ms (ease-out cubic-bezier(0.16, 1, 0.3, 1)), the thick bar trailing by 160ms. Disabled under `prefers-reduced-motion`. This is the system's only authored motion.

### Verdict

A three-column band: large barline, the verdict word at headline size in its semantic colour (Accepted in green, Failed or error in red, Grading in ink) with one line of explanation, and a stacked action column with the yellow next action on top. A points ledger beside the grading list ends with a 2px ink total rule.

### Practice Record

The book is drawn as a line of score: five measures per line between ink rules, each holding opus number, name, state and its closing barline. A practice diary grid marks solved days in ink and practised days with an inset ring.

## Do's and Don'ts

### Do:

- **Do** put exactly one Schirmer yellow (#e0a526) action on each screen, and wash only the row that holds it.
- **Do** reserve server green (#2e7d5b) for server-graded verdicts and final barlines; show in-browser test passes in graphite (#5d636c).
- **Do** use barlines (open, repeat, final) to show étude progress wherever progress appears.
- **Do** separate content with 1px rule (#d8dce1) hairlines, and close page heads and totals with a 2px ink rule.
- **Do** right-align numeric columns and use tabular figures only on bare-integer cells.
- **Do** set all code in JetBrains Mono with ligatures off.
- **Do** keep the rail or coverbar in cover blue (#2f557f) on paper (#f8f9fa); paper stays cool white.

### Don't:

- **Don't** put a kicker or eyebrow label above any heading.
- **Don't** wrap content in cards or give anything an elevation shadow.
- **Don't** colour a public, in-browser test pass green or imply points before a server verdict.
- **Don't** use yellow for decoration, emphasis, or a second action.
- **Don't** add motion beyond the final barline rise, state transitions of 160ms, and functional spinners and caret.
- **Don't** add gamified arcade devices: confetti, XP bars, badge walls.
- **Don't** shift to a dark IDE shell with a neon accent, or a cream paper.
