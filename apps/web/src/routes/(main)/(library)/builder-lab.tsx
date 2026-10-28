import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Clock } from 'lucide-react'
import { ExpertPosts } from '@/components/builder-lab/expert-posts'
import { TestStrip } from '@/components/test-strip'
import { Button } from '@/components/ui/button'
import { getExpertPosts } from '@/lib/expert-posts'

export const Route = createFileRoute('/(main)/(library)/builder-lab')({
  head: () => ({
    meta: [
      { title: 'Builder Lab · HookDrill' },
      {
        name: 'description',
        content:
          'Coming soon: practise the other half of building software. Write specs, design systems, direct AI agents and verify their work. Web apps first.',
      },
    ],
  }),
  loader: () => getExpertPosts(),
  component: BuilderLab,
})

// The builder's loop, after "The Future of Software Creation" (October 2026).
const loop = [
  {
    name: 'Specify',
    what: 'Turn a vague request into behaviour, constraints and acceptance criteria that an agent can’t misread.',
    drill:
      'Write the spec for a signup form: edge cases, errors, and what “done” means.',
  },
  {
    name: 'Design',
    what: 'Choose the boundaries, data model and API contracts before any code exists.',
    drill: 'Sketch the state and endpoints for a shared shopping list.',
  },
  {
    name: 'Direct',
    what: 'Split the work, hand agents the right context, and review their diffs like a lead.',
    drill: 'Delegate a feature to an agent, then find the bug it shipped.',
  },
  {
    name: 'Verify',
    what: 'Prove it works with tests, traces and evidence, not a fluent summary that says it does.',
    drill:
      'Write the tests that would have caught it, and watch them go green.',
  },
]

function BuilderLab() {
  const posts = Route.useLoaderData()
  return (
    <div className="flex min-w-0 max-w-4xl flex-col gap-14 py-4 md:py-8">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Builder Lab
          </h1>
          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-brand">
            Coming soon
          </span>
        </div>
        <p className="mt-5 max-w-[60ch] text-xl leading-relaxed text-foreground">
          Code is getting cheaper to write. Knowing what to build, and proving
          that it works, is getting more valuable.
        </p>
        <p className="mt-4 max-w-[65ch] leading-relaxed text-muted-foreground">
          Builder Lab is where we’ll train the future software builder: the
          person who specifies the outcome, designs the system, directs AI
          agents to build it and verifies the result before anyone ships it.
          We’re starting with web apps, in the same sandbox and with the same
          hidden tests you already drill against.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button size="lg" disabled aria-describedby="lab-status">
            <Clock /> Coming soon
          </Button>
          <p id="lab-status" className="text-sm text-muted-foreground">
            There’s no waitlist yet. The first labs will open on this page.
          </p>
        </div>
      </header>

      <section aria-labelledby="loop-heading">
        <h2 id="loop-heading" className="text-xl font-semibold tracking-tight">
          The builder’s loop
        </h2>
        <p className="mt-2 max-w-[65ch] text-muted-foreground">
          Each lab will walk one feature through four steps. Agents do more of
          the typing; you stay accountable for every step.
        </p>
        <ol className="mt-6 border-t">
          {loop.map((step, i) => (
            <li
              key={step.name}
              className="grid gap-x-8 gap-y-2 border-b py-5 md:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)]"
            >
              <p className="flex items-baseline gap-3">
                <span className="text-sm font-medium text-muted-foreground tabular-nums">
                  0{i + 1}
                </span>
                <span className="text-lg font-semibold">{step.name}</span>
              </p>
              <p className="leading-relaxed">{step.what}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  Example lab:{' '}
                </span>
                {step.drill}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <ExpertPosts posts={posts} />

      <section
        aria-labelledby="drill-heading"
        className="flex flex-col gap-6 rounded-xl border bg-card p-6 md:flex-row md:items-center md:justify-between md:p-8"
      >
        <div className="max-w-[52ch]">
          <h2
            id="drill-heading"
            className="text-xl font-semibold tracking-tight"
          >
            Fundamentals still come first
          </h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            You can’t review code you can’t read, or catch a bug you couldn’t
            have written. Until the lab opens, keep your hands sharp on the
            problems.
          </p>
          <TestStrip
            className="mt-4"
            cells={['pass', 'pass', 'pass', 'pass', 'pass', 'pass']}
            size="sm"
          />
        </div>
        <Button asChild variant="secondary" size="lg" className="shrink-0">
          <Link to="/problems">
            Keep drilling <ArrowRight />
          </Link>
        </Button>
      </section>

      <p className="text-xs text-muted-foreground">
        Based on our thesis, “The Future of Software Creation: From Manual
        Coding to AI-Orchestrated Systems” (October 2026).{' '}
        <Link to="/future" className="text-brand hover:underline">
          Read the full picture
        </Link>
        .
      </p>
    </div>
  )
}
