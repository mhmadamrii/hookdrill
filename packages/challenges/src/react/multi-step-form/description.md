Build a three-step sign-up form in `App.tsx` (default export `App`).

## Requirements

- **Steps**: 1 Account, 2 Profile, 3 Review. Show `Step N of 3`.
  - **Account**: email and password.
  - **Profile**: name, and a plan select with options `free` (label "Free") and `pro` (label "Pro"), defaulting to free.
  - **Review**: the email, the trimmed name and the plan label. Never show the password.
- **Validate on Next**: pressing **Next** checks only the current step. If anything is invalid, stay on the step and show an error under each invalid field. No errors are shown before the first Next on a step.
  - Email: something like `name@domain.tld` (an `@`, then a `.` after it, no spaces).
  - Password: at least 8 characters.
  - Name: required; spaces alone don't count.
- **Accessible errors**: an invalid field has `aria-invalid="true"`.
- **Back**: available from step 2 on (not rendered on step 1). Going back and forward keeps everything typed so far.
- **Submit**: on the review step, **Next** is replaced by a submit button. Submitting replaces the form with a success message that includes the user's name.

## Required `data-testid` selectors

| Test id           | Element                                         |
| ----------------- | ----------------------------------------------- |
| `step-indicator`  | the `Step N of 3` text                          |
| `email-input`     | email input (step 1)                            |
| `password-input`  | password input (step 1)                         |
| `name-input`      | name input (step 2)                             |
| `plan-select`     | `<select>` with `free` and `pro` (step 2)       |
| `email-error`     | email error, rendered only when invalid         |
| `password-error`  | password error, rendered only when invalid      |
| `name-error`      | name error, rendered only when invalid          |
| `next-button`     | validates the step and moves on (steps 1 and 2) |
| `back-button`     | goes to the previous step (steps 2 and 3)       |
| `submit-button`   | submits the form (step 3)                       |
| `review-email`    | the email on the review step                    |
| `review-name`     | the trimmed name on the review step             |
| `review-plan`     | the plan label ("Free" or "Pro") on review      |
| `success-message` | shown after submitting, includes the name       |
