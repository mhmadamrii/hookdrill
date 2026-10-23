---
name: HookDrill
description: A competitive-programming-grade practice platform for hand-written React UI, in light and dark.
colors:
  primary: '#4f5df0'
  primary-foreground: '#ffffff'
  ring: '#5b6cff'
  ring-dark: '#6b7aff'
  brand-text: '#4351e6'
  brand-text-dark: '#8f9aff'
  easy: '#00806f'
  medium: '#94600a'
  hard: '#d61f45'
  easy-dark: '#00b8a3'
  medium-dark: '#ffc01e'
  hard-dark: '#ff5a75'
  accepted: '#18864b'
  wrong: '#d92d20'
  accepted-dark: '#2cbb5d'
  wrong-dark: '#ef4743'
  banner-daily: '#3f4cd8'
  banner-plan: '#0a6b5f'
  banner-contest: '#8a2347'
  ground: '#f7f8fa'
  panel: '#ffffff'
  surface-2: '#f1f3f6'
  secondary: '#eef0f4'
  border: '#e3e6eb'
  input: '#dcdfe5'
  ink: '#0f1115'
  muted-ink: '#5c6370'
  graphite-ground: '#1a1a1a'
  graphite-panel: '#262626'
  graphite-popover: '#2c2c2c'
  graphite-surface-2: '#303030'
  graphite-border: '#353535'
  graphite-ink: '#eff1f6'
  graphite-muted-ink: '#a3a6ad'
typography:
  hero:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '2.75rem'
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: '-0.04em'
    fontFeature: "'cv11', 'ss01'"
  headline:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: '-0.025em'
  title:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: '-0.025em'
  panel-title:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 600
    lineHeight: 1.43
  body:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "'cv11', 'ss01'"
  statement:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '15px'
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1.33
  micro:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.6875rem'
    fontWeight: 500
    lineHeight: 1
  data:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    fontFeature: "'tnum'"
  code:
    fontFamily: 'JetBrains Mono Variable, ui-monospace, SF Mono, Menlo, monospace'
    fontSize: '0.85em'
    fontWeight: 400
    fontFeature: "'liga' 0, 'calt' 0"
rounded:
  cell: '3px'
  sm: '6px'
  md: '8px'
  lg: '10px'
  xl: '14px'
  full: '9999px'
spacing:
  gutter: '8px'
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
  container: '1440px'
  header: '56px'
  workspace-bar: '48px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-foreground}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '36px'
  button-submit:
    backgroundColor: '{colors.accepted}'
    textColor: '{colors.primary-foreground}'
    rounded: '{rounded.md}'
    padding: '0 12px'
    height: '32px'
  button-secondary:
    backgroundColor: '{colors.secondary}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '36px'
  input:
    backgroundColor: '{colors.panel}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '4px 12px'
    height: '36px'
  panel:
    backgroundColor: '{colors.panel}'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    padding: '16px'
  panel-tabs:
    backgroundColor: '{colors.surface-2}'
    height: '40px'
    padding: '0 8px'
  difficulty-pill:
    backgroundColor: '{colors.surface-2}'
    rounded: '{rounded.full}'
    padding: '0 10px'
    height: '24px'
    typography: '{typography.label}'
  sample-chip:
    textColor: '{colors.muted-ink}'
    rounded: '{rounded.full}'
    padding: '0 8px'
    height: '20px'
    typography: '{typography.micro}'
  test-cell:
    backgroundColor: '{colors.accepted}'
    rounded: '{rounded.cell}'
    size: '14px'
  test-cell-sm:
    backgroundColor: '{colors.accepted}'
    rounded: '{rounded.cell}'
    size: '10px'
  banner:
    backgroundColor: '{colors.banner-daily}'
    textColor: '{colors.primary-foreground}'
    rounded: '{rounded.lg}'
---

# Design System: HookDrill

## Overview

**Creative North Star: "The Practice Arena"**

HookDrill is built to the category standard set by LeetCode, HackerRank and Codeforces. Pages are dense and fast. Problem tables, a split coding workspace, dashboards, contests and rankings all sit on a quiet neutral ground, and colour is kept for meaning: what to click, how hard a problem is, and whether the tests passed. The world is the same in light and dark mode. Dark is a neutral graphite with no blue tint, after the LeetCode references. Light is a cool off-white ground with white panels. Both themes use the same token names, and components reference only those semantic tokens, never raw theme hexes.

Depth comes from tone, not shadow. Panels are flat, rounded rectangles with a 1px border, sitting on the page ground. In the workspace they float apart with 8px gutters. The one signature is the test strip: one small square per test, filled pass-green or fail-red, read left to right. It carries HookDrill's promise that every result comes from real tests, and it appears wherever results appear.

This world replaces the rejected "Étude Edition" world. Nothing editorial, paper-like or music-book carries over, and there is no arcade gamification (confetti, XP bars).

**Key Characteristics:**

- Dense, tabular and calm. Colour signals state, never decorates.
- Matching light and dark themes from one semantic token set. The theme follows the system setting until the user chooses, then persists, and a pre-paint script prevents a flash.
- Flat bordered panels, gently rounded (10px), with tonal surface steps instead of shadows.
- Inter for everything except code. Numbers are tabular.
- The test strip is the signature mark.
- Sample data is always labelled as sample.

## Colors

The palette is a neutral ground plus one blue-violet brand accent. A small set of category-standard semantic colours carries difficulty and verdict.

### Primary

- **Drill Blue-Violet** (primary): primary buttons ("Start practicing", the shuffle action), focus rings (ring / ring-dark), selection tint, heat-map top step. It is the same in both themes. Use **Brand Text** (brand-text / brand-text-dark) for text and link hovers in the accent, such as a problem title on row hover. It is a darker step in light mode and a lighter one in dark mode so it stays legible.

### Secondary (semantic: difficulty)

- **Easy Teal, Medium Amber, Hard Rose** (easy / medium / hard, with -dark pairs): the difficulty word in tables, pills, progress bars and banners. Each light value is a darkened, text-safe step of the category's convention. Each dark value is the bright convention hue.

### Tertiary (semantic: verdict)

- **Accepted Green** (accepted / accepted-dark): passed tests, the "Accepted" verdict, solved status, the current-day calendar marker, and the Submit button.
- **Wrong Red** (wrong / wrong-dark): failed tests and the "Wrong Answer" verdict. Destructive actions use the separate destructive token.

### Banner fills

- **Daily Indigo, Plan Teal, Contest Wine** (banner-daily / banner-plan / banner-contest): solid fills for the three promo banners above the problems table. They are identical in both themes, like LeetCode's banner art, and carry white text. Each holds its own inline SVG illustration.

### Neutral

- **Cool Ground** (ground): light page background. **White Panel** (panel): cards, panels, odd table rows, popovers. **Surface Step** (surface-2): panel tab bars, pill fills, idle test cells, inline code. **Quiet Fill** (secondary): secondary buttons, chips, count badges. **Hairline** (border) and **Field Edge** (input). **Ink** (ink) for text and **Muted Ink** (muted-ink) for metadata and locked rows.
- **Graphite Ground** (graphite-ground): dark page background. **Graphite Panel** (graphite-panel), **Graphite Popover** (graphite-popover) and **Graphite Step** (graphite-surface-2) are the three tonal panel steps. **Graphite Border** (graphite-border), **Graphite Ink** (graphite-ink) and **Graphite Muted Ink** (graphite-muted-ink) complete the set.
- The heat-map ramp (heat-0 to heat-4) runs from the neutral step to the brand accent in five steps, one ramp per theme.
- Code syntax uses the GitHub-light palette in light mode and the VS Code dark palette in dark mode, exposed as code-* custom properties. The Sandpack editor theme reads them, so the editor follows the app theme.
- Rating tiers on leaderboards and profiles use Codeforces-style colours from the theme-independent Tailwind palette (see sample-data rating tiers).

### Named Rules

**The One Accent Rule.** Blue-violet is the only brand hue. It marks primary actions and focus, and nothing else competes with it as decoration.

**The Text-Safe Difficulty Rule.** Every difficulty colour passes WCAG AA as text on both zebra rows in both themes. Never dim a difficulty colour with opacity. A locked row dims through its muted title colour only.

**The Verdict Rule.** Green means accepted and red means wrong, everywhere: test cells, verdict headings, status icons. The Submit button is accepted green, as on LeetCode.

**The Solid Banner Rule.** Banner fills are solid tokens. Illustration accents inside the banner SVG art are allowed. Gradient fills and glows are not.

## Typography

**Display Font:** Inter Variable (with ui-sans-serif, system-ui)
**Body Font:** Inter Variable, with stylistic sets cv11 and ss01 enabled on the body
**Label/Mono Font:** JetBrains Mono Variable (with ui-monospace, SF Mono, Menlo), for code only

**Character:** One neutral sans for the whole interface, tightened with negative tracking at large sizes. It is set dense, at 14px, for working pages. A monospace appears only where the content really is code.

### Hierarchy

- **Hero** (600, text-hero step 2.75rem growing to 3.75rem / 4.5rem at sm / xl, tracking -0.04em): the landing headline only.
- **Headline** (600, 1.875rem rising to 2.25rem, tracking -0.025em): landing section headings and the contest hero.
- **Title** (600, 1.5rem, tracking tight): the problem title in the workspace and the sign-in heading. Profile and prompt titles use 1.25rem.
- **Panel title** (600, 14px): the heading of every dashboard, rail and leaderboard panel.
- **Body** (400, 14px): tables, lists, controls. Problem statements use a relaxed 15px with a 28px line height.
- **Label** (500, 12px): table column headers, pills, metadata lines.
- **Micro** (500, text-2xs step 11px): Sample chips, count badges, date-tile months, and chips in banner meta lines.
- **Code** (JetBrains Mono, 0.85em inline): the editor, inline code in statements, file tabs.

### Named Rules

**The Tabular Numbers Rule.** Every count, percentage, rating, rank, date and timer uses tabular numerals, so columns line up.

**The Code-Only Mono Rule.** JetBrains Mono is for code, with ligatures off (code, pre and the editor content). UI labels, numbers and badges are never set in mono.

**The Named Steps Rule.** Beyond Tailwind's ramp, the only type steps are text-2xs (11px) and text-hero (2.75rem). New one-off pixel sizes are not part of the system.

## Layout

App pages sit in a centred container of up to 1440px, with 16px side padding rising to 24px from md. A sticky 56px top bar holds the logo, primary navigation (Problems, Explore, Contests, Leaderboard), search, the theme toggle and the user menu.

The problems page has three columns: a library sidebar, the main column (banner row, topic tabs, filter bar, table) and a right rail (streak calendar, progress, trending topics). Dashboard, leaderboard and profile follow the same pattern, a main column plus a rail of panels. Spacing is tight: 8px is the dominant gap, then 6px and 12px. Panels use 16px internal padding and 20px for hero-scale cards.

The workspace is full-height. A 48px bar has the problem navigation on the left, a centred Run/Submit pill, and account actions on the right. Below it, resizable floating panels (description | code over preview/console) sit on the page ground with 8px gutters. The resize handles are transparent and tint the accent on hover or drag. On mobile, the workspace becomes a tabbed stack (Problem / Code / Console). Site navigation collapses below sm and the right rails stack under the main column.

## Elevation & Depth

The system is flat with tonal layering. Panels sit on the ground at rest with only a 1px border. In dark mode, depth reads through the step from ground (#1a1a1a) to panel (#262626), popover (#2c2c2c) and surface step (#303030). Shadows are limited to what the primitives ship for transient overlays (menus, popovers, dialogs, sheets) and the hairline xs lift on outline buttons, inputs and the Run/Submit pill.

### Shadow Vocabulary

- **Hairline lift** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): outline buttons, inputs, the Run/Submit pill.
- **Overlay** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): dropdowns, popovers, selects, chart tooltips.
- **Modal** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): dialogs and sheets.

### Named Rules

**The No-Glow Rule.** No glows, coloured shadows or decorative gradients. Surfaces separate by tone and hairline, not by light.

**The Flat Panel Rule.** Content panels never cast shadows. If a panel needs to stand out, give it a different tonal step, not elevation.

## Shapes

Corners are gently rounded, all derived from one 10px radius: panels, banners and table rows use 10px, buttons and inputs 8px, small controls 6px. Pills, chips, avatars and badges are fully round. Test cells are tiny 3px-rounded squares. Table rows are separate rounded bars, zebra-striped (odd rows on the panel colour, even rows on the ground) instead of being divided by rules. Borders are always 1px hairlines. A dashed hairline means "not real yet": Sample chips and empty states.

## Components

### Buttons

Compact and conventional, after shadcn new-york.

- **Shape:** gently rounded (8px), 36px tall by default, with 32px small and 24px extra-small sizes.
- **Primary:** blue-violet fill, white text, medium weight. Hover drops to 90% fill.
- **Submit:** accepted-green fill, white text. Used only for Submit in the workspace pill.
- **Secondary / Outline / Ghost:** quiet fill, bordered panel, or bare with the accent fill on hover.
- **Focus:** 3px ring of the ring token at 50%, plus a ring-coloured border.

### Chips

- **Meta chips:** small round pills on the surface step or quiet fill (Topics, Hint, contest kind, topic counts). Labels that would otherwise sit above a heading go here, inline in the meta line.
- **Sample chip:** 20px, micro type, muted ink, dashed hairline border ("Sample data", "Sample"). It is required wherever sample content could pass for real.
- **Difficulty pill:** 24px round pill on the surface step with the difficulty colour as text.

### Cards / Containers

- **Corner Style:** 10px.
- **Background:** panel colour on the page ground. Banners use their solid banner tokens.
- **Shadow Strategy:** none (see Elevation).
- **Border:** 1px hairline.
- **Internal Padding:** 16px, with a 48px header row holding the panel title, an optional Sample chip and actions.

### Inputs / Fields

- **Style:** 36px, 8px radius, input-edge border, transparent fill (input tint at 30% in dark), muted placeholder. The header search is a rounded field with a ⌘K hint.
- **Focus:** ring-coloured border plus a 3px ring at 50%.
- **Error / Disabled:** destructive border and ring. Disabled at 50% opacity.

### Navigation

The top bar has 14px muted links that turn ink on hover. The active link is ink with a 2px rounded underline flush to the bar's bottom edge. The bar is sticky, with a translucent ground and a backdrop blur. The workspace swaps it for its own 48px bar. Panel tab bars are 40px strips on the surface step tint.

### Problem Table

Separate rounded zebra rows, 44px tall: status icon, numbered title, acceptance % (tabular, headed by a Sample chip), short difficulty word, and a lock for unplayable problems. Playable rows take the accent fill on hover and the title turns brand-text. Locked rows are muted.

### Test Strip (signature)

One square cell per test, 3px gaps, read left to right: 14px cells (10px small). Pass is accepted green, fail is wrong red, running is a pulsing accent at 60%, idle is the surface step with an inset hairline outline. It carries an accessible label ("n of m tests passed"). It appears in the workspace console under the verdict, the landing hero mock, dashboard recent activity, the profile and sign-in.

### Workspace Console

A verdict heading in the verdict colour ("Accepted" / "Wrong Answer"), then a count and time line, the test strip, and case tabs, each tab with a pass/fail dot.

## Do's and Don'ts

### Do:

- **Do** use only semantic tokens (background, card, surface-2, primary, easy, accepted…) so every surface works in both themes.
- **Do** keep blue-violet for primary actions, focus and the accent hover. Use brand-text when the accent is text.
- **Do** colour the Submit button accepted green and the verdict in its verdict colour.
- **Do** render every set of test results as a test strip.
- **Do** label sample problems, contests, players, scores and acceptance rates with a Sample chip.
- **Do** describe in-browser runs as running the public tests. Never present them as server grading.
- **Do** use tabular numerals for every number, and JetBrains Mono with ligatures off for code only.
- **Do** put workspace panels on the page ground with 8px gutters, with Run/Submit centred in a pill.

### Don't:

- **Don't** add glows, coloured shadows or decorative gradients. Banners stay solid.
- **Don't** put eyebrows or kickers above headings. Move the label into a chip in the meta line.
- **Don't** dim difficulty or verdict colours with opacity.
- **Don't** introduce a second brand accent, or use the banner fills outside banners.
- **Don't** add new arbitrary pixel type sizes. Use the Tailwind ramp plus text-2xs and text-hero.
- **Don't** bring back the Étude Edition world (paper, editorial serif, barlines) or arcade gamification (confetti, XP bars).
