import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Bot, User } from 'lucide-react'
import { ExpertPosts } from '@/components/builder-lab/expert-posts'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { getExpertPosts } from '@/lib/expert-posts'

export const Route = createFileRoute('/_site/future')({
  head: () => ({
    meta: [
      { title: 'How software gets built next · HookDrill' },
      {
        name: 'description',
        content:
          'AI agents are taking over more of the typing. Step by step, how software gets built next, what experts are saying, and why HookDrill trains the developers who will build it.',
      },
    ],
  }),
  loader: () => getExpertPosts(),
  component: Future,
})

// After "The Future of Software Creation" (HookDrill, October 2026), section 3.
const stages = [
  {
    name: 'Define the outcome',
    you: 'Start from the user, the goal and how success is measured, not a list of files to edit.',
    agents: 'Ask clarifying questions and surface edge cases you skipped.',
  },
  {
    name: 'Write the specification',
    you: 'Review and correct user stories, data models, API contracts and acceptance tests.',
    agents: 'Turn the goal into a structured, increasingly executable spec.',
  },
  {
    name: 'Design the system',
    you: 'Choose the architecture, the boundaries and which existing services to build on.',
    agents: 'Propose options and wire up the integration scaffolding.',
  },
  {
    name: 'Delegate the build',
    you: 'Split the work, set the rules, review the risky changes and resolve conflicts.',
    agents: 'Implement in parallel: frontend, backend, data, tests, docs.',
  },
  {
    name: 'Verify the behaviour',
    you: 'Judge the evidence: test results, traces, measured performance. Not a fluent “done”.',
    agents:
      'Run unit, end-to-end, accessibility and security checks; analyse failures.',
  },
  {
    name: 'Deploy with guardrails',
    you: 'Set the boundaries: credentials, environments, spending limits, who approves what.',
    agents:
      'Prepare releases, deploy to staging, promote when the policy allows.',
  },
  {
    name: 'Monitor and maintain',
    you: 'Own the incidents, the trade-offs and the access an agent is allowed to have.',
    agents:
      'Spot anomalies, summarise incidents, propose patches as pull requests.',
  },
]

const roleShift = [
  [
    'Implementing routine changes by hand',
    'Defining tasks and delegating implementation',
  ],
  [
    'Writing boilerplate and repetitive tests',
    'Reviewing coverage and validating behaviour',
  ],
  [
    'Knowing every framework detail from memory',
    'Understanding concepts and judging generated code',
  ],
  [
    'Sequential handoffs between people',
    'Coordinating parallel agents through shared interfaces',
  ],
  [
    'Reviewing every line the same way',
    'Reviewing by risk, uncertainty and impact',
  ],
  [
    'Deploying through manual procedures',
    'Designing safe, observable release automation',
  ],
  [
    'Delivering the requested feature',
    'Owning outcomes, reliability, security and value',
  ],
]

const stillHard = [
  'Turning vague business goals into correct requirements',
  'Complex state, concurrency and distributed failure',
  'Protecting sensitive data and security boundaries',
  'Proving correctness where tests can’t cover everything',
  'Keeping large, old codebases consistent',
]

const sources = [
  {
    label:
      'Gartner: Top Strategic Trends in Software Engineering for 2025 and Beyond (July 2025)',
    href: 'https://www.gartner.com/en/newsroom/press-releases/2025-07-01-gartner-identifies-the-top-strategic-trends-in-software-engineering-for-2025-and-beyond',
  },
  {
    label: 'Anthropic: 2026 Agentic Coding Trends Report',
    href: 'https://resources.anthropic.com/2026-agentic-coding-trends-report',
  },
  {
    label: 'Stack Overflow: 2025 Developer Survey',
    href: 'https://survey.stackoverflow.co/2025/',
  },
]

const prose =
  'max-w-[68ch] text-base leading-relaxed text-pretty text-muted-foreground md:text-lg'

function Future() {
  const posts = Route.useLoaderData()
  return (
    <>
      <main className="mx-auto flex max-w-5xl flex-col gap-20 px-4 py-14 md:px-6 md:py-20">
        <header className="max-w-3xl">
          <h1 className="text-hero leading-[1.05] font-semibold tracking-[-0.035em] text-balance md:text-6xl">
            How software gets built next
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-pretty md:text-2xl">
            AI agents are taking over more of the typing. The job isn’t going
            away: it’s moving up the stack, to deciding what to build, directing
            the agents that build it, and proving the result works.
          </p>
          <p className="mt-5 text-sm text-muted-foreground">
            HookDrill’s thesis, October 2026. A forecast, not a certainty.
          </p>
        </header>

        <section aria-labelledby="signals-heading">
          <h2
            id="signals-heading"
            className="text-2xl font-semibold tracking-tight md:text-3xl"
          >
            It has already started
          </h2>
          <ul className="mt-6 max-w-[68ch] divide-y border-y text-base leading-relaxed md:text-lg">
            <li className="py-4">
              Gartner expects <strong className="font-semibold">90%</strong> of
              enterprise software engineers to use AI code assistants by 2028,
              up from under 14% in early 2024.
            </li>
            <li className="py-4">
              In Stack Overflow’s 2025 survey,{' '}
              <strong className="font-semibold">84%</strong> of developers use
              or plan to use AI tools, and{' '}
              <strong className="font-semibold">66%</strong> are frustrated by
              answers that are “almost right”.
            </li>
            <li className="py-4">
              Anthropic’s 2026 report describes developers handing more
              implementation to agents while staying in charge of setup,
              supervision, review and validation.
            </li>
          </ul>
          <p className={`mt-6 ${prose}`}>
            Adoption and trust are separate problems. A plausible implementation
            is not a correct, secure, maintainable system, so as agents write
            more code, tests, review and clear requirements matter more, not
            less.
          </p>
        </section>

        <section aria-labelledby="workflow-heading">
          <h2
            id="workflow-heading"
            className="text-2xl font-semibold tracking-tight md:text-3xl"
          >
            The workflow, step by step
          </h2>
          <p className={`mt-3 ${prose}`}>
            One plausible way a feature gets built around 2031. Agents carry
            more of every step; a person stays accountable for each one.
          </p>
          <ol className="mt-10">
            {stages.map((s, i) => (
              <li
                key={s.name}
                className="relative grid gap-4 pb-10 pl-12 last:pb-0 md:grid-cols-[14rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-8"
              >
                <span
                  aria-hidden
                  className="absolute top-0 left-0 grid size-8 place-items-center rounded-full border bg-card text-sm font-semibold tabular-nums"
                >
                  {i + 1}
                </span>
                {i < stages.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute top-9 bottom-1 left-4 w-px bg-border"
                  />
                )}
                <h3 className="pt-1 text-lg font-semibold">{s.name}</h3>
                <p className="flex gap-3 leading-relaxed">
                  <User
                    className="mt-1 size-4 shrink-0 text-brand"
                    aria-label="You"
                  />
                  <span>{s.you}</span>
                </p>
                <p className="flex gap-3 leading-relaxed text-muted-foreground">
                  <Bot className="mt-1 size-4 shrink-0" aria-label="Agents" />
                  <span>{s.agents}</span>
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="role-heading">
          <h2
            id="role-heading"
            className="text-2xl font-semibold tracking-tight md:text-3xl"
          >
            What changes for the engineer
          </h2>
          <div className="mt-8 overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[34rem] text-left text-[15px]">
              <thead className="bg-surface-2/60 text-sm text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Less of
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    More of
                  </th>
                </tr>
              </thead>
              <tbody>
                {roleShift.map(([from, to]) => (
                  <tr key={from} className="border-t">
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {from}
                    </td>
                    <td className="px-5 py-3.5">{to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`mt-6 ${prose}`}>
            None of this makes code literacy optional. Reading, debugging and
            reasoning about code is exactly what lets an engineer evaluate what
            an agent produced, and catch the error a polished explanation hides.
          </p>
        </section>

        <ExpertPosts posts={posts} />

        <section
          aria-labelledby="hard-heading"
          className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12"
        >
          <div>
            <h2
              id="hard-heading"
              className="text-2xl font-semibold tracking-tight md:text-3xl"
            >
              What stays hard
            </h2>
            <p className={`mt-3 ${prose}`}>
              AI will get better at all of these. They stay risky to hand over
              blindly because they involve uncertainty, consequences and
              reasoning about the whole system.
            </p>
          </div>
          <ul className="divide-y border-y">
            {stillHard.map((t) => (
              <li key={t} className="py-3.5 leading-relaxed">
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="why-heading" className="border-t pt-12">
          <h2
            id="why-heading"
            className="text-3xl font-semibold tracking-[-0.03em] text-balance md:text-4xl"
          >
            Why HookDrill exists
          </h2>
          <div className="mt-5 max-w-[68ch] space-y-4 text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
            <p>
              The routine tasks juniors used to learn on are the first ones
              agents take. Skills that nobody practises fade quietly, and the
              people who will direct agents tomorrow still need to recognise
              good code when they see it.
            </p>
            <p className="text-foreground">
              HookDrill is a learning platform for the developers who will build
              software this way, starting with web apps. It trains both halves
              of the job.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col rounded-xl border bg-card p-5">
              <h3 className="flex items-center gap-2 font-semibold">
                <span className="rounded-full bg-secondary px-2 py-0.5 text-2xs font-medium text-muted-foreground">
                  Open now
                </span>
                Drills
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                Build real React components from a spec, by hand, with hidden
                tests as the judge. The fundamentals you need to read and repair
                what agents write.
              </p>
              <div className="h-5 shrink-0" />
              <Button asChild className="mt-auto self-start">
                <Link to="/problems">
                  Start practicing <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="flex flex-col rounded-xl border bg-card p-5">
              <h3 className="flex items-center gap-2 font-semibold">
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-2xs font-medium text-brand">
                  Soon
                </span>
                Builder Lab
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                Practise the other half: write the spec, design the system,
                direct an agent, and verify what it shipped. Same sandbox, same
                hidden tests.
              </p>
              <div className="h-5 shrink-0" />
              <Button asChild variant="outline" className="mt-auto self-start">
                <Link to="/builder-lab">
                  See Builder Lab <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="sources-heading" className="border-t pt-8">
          <h2 id="sources-heading" className="text-sm font-semibold">
            Sources
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {sources.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground hover:underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-[72ch] text-xs leading-relaxed text-muted-foreground">
            The 2031 workflow is a reasoned extrapolation from current trends,
            not a prediction that every team will work this way. Survey figures
            depend on who responded; forecasts come from the organisations
            named.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
