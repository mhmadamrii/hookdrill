export type Faq = { id: string; question: string; answer: string };

export const FAQ: Faq[] = [
  {
    id: "what",
    question: "What is HookDrill?",
    answer: "A place to practise building UI by hand, checked by tests.",
  },
  {
    id: "ai",
    question: "Can I use AI here?",
    answer: "No. The editor has no autocomplete on purpose.",
  },
  {
    id: "tests",
    question: "Can I see the tests?",
    answer: "You see each test's name and result, never its code.",
  },
];
