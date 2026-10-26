Build an FAQ accordion in `App.tsx` (default export `App`). The questions and answers are in `faq.ts`.

## Requirements

- **Collapsed at first**: every section starts closed, showing only its question.
- **Open**: clicking a question shows its answer.
- **Close**: clicking the open question again hides its answer.
- **One at a time**: opening a section closes whichever section was open.
- **Accessible**: each question is a `<button>` with `aria-expanded` set to `true` when its section is open and `false` when closed. While open, its `aria-controls` must equal the `id` of the answer element.
- Render the answer only while its section is open.

## Required `data-testid` selectors

| Test id             | Element                                              |
| ------------------- | ---------------------------------------------------- |
| `accordion-item`    | one per FAQ entry, in `FAQ` order                    |
| `accordion-trigger` | the question button, inside `accordion-item`         |
| `accordion-panel`   | the answer, inside `accordion-item`, only while open |
