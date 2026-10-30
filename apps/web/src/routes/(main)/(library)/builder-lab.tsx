import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/(library)/builder-lab')({
  head: () => ({
    meta: [
      { title: 'System Design · HookDrill' },
      {
        name: 'description',
        content: 'Explore common system design interview questions.',
      },
    ],
  }),
  component: SystemDesign,
})

const questions = [
  'Design a URL shortener (like bit.ly).',
  'Design a chat system / WhatsApp / Slack.',
  'Design a news feed / Twitter timeline.',
  'Design a rate limiter.',
  'Design a distributed cache / key-value store (like Redis or DynamoDB).',
  'Design an e-commerce checkout system or inventory system.',
  'Design a notification system.',
  'Design YouTube / Netflix video streaming.',
  'How would you scale a web application from 1,000 to 100 million users?',
  'Design a search autocomplete / typeahead system.',
] as const

function SystemDesign() {
  return (
    <div className="flex min-w-0 max-w-4xl flex-col gap-8 py-4 md:py-8">
      <header>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          System Design
        </h1>
        <p className="mt-4 max-w-[65ch] text-lg leading-relaxed text-muted-foreground">
          A collection of system design questions to explore. Guided practice
          will be available later.
        </p>
      </header>

      <section aria-labelledby="questions-heading">
        <h2 id="questions-heading" className="text-xl font-semibold tracking-tight">
          Questions
        </h2>
        <ol className="mt-4 divide-y rounded-xl border">
          {questions.map((question, index) => (
            <li key={question}>
              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-start gap-4 px-4 py-4 text-left opacity-60 md:px-5"
                aria-label={`${question} — unavailable yet`}
              >
                <span className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 leading-relaxed">{question}</span>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  Soon
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
