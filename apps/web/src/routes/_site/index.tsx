import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { DifficultyText } from '@/components/difficulty'
import { HowItWorks } from '@/components/landing/how-it-works'
import { ProblemPreview } from '@/components/landing/problem-preview'
import { WorkspaceMock } from '@/components/landing/workspace-mock'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'
import { playableProblems } from '@/lib/problems'

import {
  Arena,
  FinalCta,
  Tracks,
  WhyByHand,
} from '@/components/landing/sections'

export const Route = createFileRoute('/_site/')({
  head: () => ({
    meta: [
      {
        title: 'HookDrill · Write real React by hand, verified by hidden tests',
      },
      {
        name: 'description',
        content:
          'A learning platform for the developers who will build software alongside AI agents. Drill real React components by hand, verified by hidden tests.',
      },
    ],
  }),
  component: Landing,
})

/** Keyframes used only by the landing mocks. */
const landingCss = `
@keyframes caret { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
@media (prefers-reduced-motion: reduce) { .landing [class*="animate-"] { animation: none !important } }
`

function Landing() {
  const { data: session } = useSession()
  const signedIn = !!session?.user
  return (
    <div className="landing overflow-x-clip">
      <style>{landingCss}</style>
      <Hero signedIn={signedIn} />
      <HowItWorks />
      <ProblemPreview />
      <WhyByHand />
      <Tracks />
      <Arena />
      <FinalCta signedIn={signedIn} />
      <SiteFooter />
    </div>
  )
}

function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section aria-labelledby="hero-heading" className="relative">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-4 pt-14 pb-20 md:px-6 md:pt-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:pt-24 lg:pb-28">
        <div className="max-w-xl">
          <h1
            id="hero-heading"
            className="text-hero leading-[1.02] font-semibold tracking-[-0.04em] text-balance sm:text-6xl xl:text-7xl"
          >
            Keep your hands on the code.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-pretty text-muted-foreground md:text-xl">
            AI agents write more of the code every month. Someone still has to
            know good code when they see it. Build real React components from a
            spec, by hand, and let hidden tests judge.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-11 px-6 text-[15px]">
              <Link to={signedIn ? '/dashboard' : '/problems'}>
                {signedIn ? 'Go to dashboard' : 'Start practicing'}
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 px-6 text-[15px]"
            >
              <Link to="/problems/$slug" params={{ slug: 'todo-list' }}>
                Try Todo List
              </Link>
            </Button>
          </div>
          <Link
            to="/future"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
          >
            How software gets built next, and why we exist
            <ArrowRight className="size-3.5" />
          </Link>
          <div className="mt-8 border-t pt-5">
            <p className="text-sm text-muted-foreground">
              Open now in the React track
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {playableProblems.map((p) => (
                <li key={p.slug}>
                  <Link
                    to="/problems/$slug"
                    params={{ slug: p.slug }}
                    className="inline-flex h-8 items-center gap-2 rounded-full border bg-card px-3 text-sm font-medium transition-colors hover:border-foreground/20 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {p.title}
                    <DifficultyText level={p.difficulty} className="text-xs" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative isolate min-w-0">
          <WorkspaceMock />
        </div>
      </div>
    </section>
  )
}
