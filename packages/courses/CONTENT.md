# Course content process

Course content is graded material: a wrong fact or an ambiguous question costs a learner a pass. Every lesson goes through the same steps, and no lesson ships without them.

## The lesson specification

`src/types.ts` is the spec. Every lesson has, in order:

1. **Learning objectives:** two or three, each completing "By the end, you can ...". Every question measures one of them.
2. **Conceptual explanation:** intuition first, then precise terms, examples, diagrams and detail.
3. **Real-world application:** how the idea shows up in a real system, including its limits.
4. **Common misconceptions:** plausible wrong beliefs and why they're wrong.
5. **Question bank:** 8 multiple-choice questions spanning recall, concept and application, at least 2 per objective.
6. **Explanations for every option:** why the answer is right and why each distractor is wrong.
7. **References:** sources that back the facts, kept apart from further reading. Our own illustrations go in `example` blocks, which the UI labels "Teaching example".

Each submodule adds 8 exam-only questions that combine ideas across its lessons.

## Assessment rules

| Assessment     | Rule                                                      |
| -------------- | --------------------------------------------------------- |
| Lesson quiz    | 6 questions drawn from the lesson's 8                     |
| Submodule exam | 15 questions from all lesson banks plus exam questions    |
| Pass mark      | 80%                                                       |
| Failing        | Review every explanation, retry with a fresh draw         |
| Selection      | Round-robin across objectives, so no objective is skipped |
| Progression    | Passing a submodule exam unlocks the next submodule       |
| Practical work | Required at project milestones in later modules           |

Multiple choice checks conceptual understanding only. From Phase 2 on, modules add coding exercises in the sandbox, and Phase 7 is graded projects.

## Writing and verifying a lesson

1. **Define the objectives.** What should the learner understand or be able to do?
2. **Find authoritative references:** university courses, official framework docs, established textbooks, original papers. The course's backbone: Google's Machine Learning Crash Course, Stanford CS229, the Hugging Face LLM Course and the PyTorch tutorials.
3. **Cross-check claims.** Dates, attributions and numbers are verified against a fetched source. If a claim can't be verified, it's cut.
4. **Write in our own words.** Never copy course text.
5. **Validate every question:** one defensible best answer, no "all/none of the above", distractors drawn from real misconceptions, options of similar length. Avoid questions whose answer the field still disputes.
6. **Version it.** Set `reviewedAt`. Label the lesson `foundational`, `current-practice` or `emerging`.

## Review before publishing

A second reviewer, not the author, checks each submodule for:

- technical accuracy of every claim and every answer key
- questions with two defensible answers or a giveaway option
- objectives with no questions, or questions with no objective
- reading level and length (`minutes` should be honest)
- broken or non-authoritative references

Structural checks (ids unique, 8 questions per lesson, every objective covered, answer ids valid) run with `pnpm --filter @hookdrill/courses check`.

## Maintenance

- `current-practice` lessons: re-review every 6 months. Tools and APIs move fast.
- `emerging` lessons: re-review every 3 months.
- `foundational` lessons: re-review yearly, or when a reference moves.
- On review, update `reviewedAt` and fix or replace dead references.

## Build order

1. Curriculum specification: the roadmap in `src/ai-engineer/index.ts`.
2. Content schema: `src/types.ts`.
3. Pilot module: Module 01, complete. **Done.**
4. Quality review of the pilot, then adjust this process.
5. Scale: remaining modules one at a time, each reviewed before it is linked into the roadmap.
6. Continuous maintenance, as above.
