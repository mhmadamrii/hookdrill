Build a password strength meter in `App.tsx` (default export `App`).

## Requirements

- **Rules**: as the user types, check the password against four rules and mark each one met or not:
  - `length`: at least 8 characters
  - `number`: contains a digit
  - `uppercase`: contains an uppercase letter A–Z
  - `symbol`: contains a character that is not a letter or digit
- **Strength**: `Weak` when 0 or 1 rules are met, `Medium` for 2 or 3, `Strong` for all 4.
- **Show/Hide**: the input starts as `type="password"`. The toggle switches it to `type="text"` and its label from `Show` to `Hide`, and back.

Each rule item has `data-rule` set to its name above, and `data-met="true"` or `data-met="false"`.

## Required `data-testid` selectors

| Test id             | Element                                       |
| ------------------- | --------------------------------------------- |
| `password-input`    | the password `<input>`                        |
| `visibility-toggle` | the Show/Hide `<button>`                      |
| `rule`              | one per rule, with `data-rule` and `data-met` |
| `strength`          | the strength label                            |
