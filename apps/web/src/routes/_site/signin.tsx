import { createFileRoute } from '@tanstack/react-router'
import { FileCode2, ListChecks, Trophy } from 'lucide-react'
import { SignInCard } from '@/components/auth/sign-in-card'
import { TestStrip } from '@/components/test-strip'

export const Route = createFileRoute('/_site/signin')({
  head: () => ({ meta: [{ title: 'Sign in · HookDrill' }] }),
  component: SignIn,
})

const benefits = [
  {
    icon: FileCode2,
    title: 'Your drafts are kept',
    body: 'Code you write in the editor is saved to your account, so you can pick a problem up on another day.',
  },
  {
    icon: ListChecks,
    title: 'Progress on every problem',
    body: 'See which problems you solved, which tests passed and how many hints you opened.',
  },
  {
    icon: Trophy,
    title: 'Contests, later',
    body: 'Timed contests and ratings arrive with server grading. Your account will be ready for them.',
  },
]

function SignIn() {
  return (
    <main className="relative isolate overflow-hidden">
      {/* subtle dot grid, faded at the edges; uses the border token so it follows the theme */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1.2px,transparent_1.2px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
      />
      <div className="mx-auto grid min-h-[calc(100dvh-3.5rem)] max-w-[1100px] items-center gap-12 px-4 py-10 md:px-6 lg:grid-cols-[1fr_420px] lg:gap-20">
        <section aria-labelledby="why-sign-in" className="order-2 lg:order-1">
          <h2
            id="why-sign-in"
            className="max-w-md text-3xl font-bold tracking-tight text-balance sm:text-4xl"
          >
            <span className="block">Write it by hand.</span>
            <span className="block">Let the tests decide.</span>
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Practice is open without an account. Signing in keeps your work.
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <TestStrip
              cells={[
                'pass',
                'pass',
                'pass',
                'pass',
                'fail',
                'pass',
                'pass',
                'pass',
              ]}
            />
            <span className="tabular-nums">7 of 8 tests passing</span>
          </div>
          <ul className="mt-8 max-w-md space-y-5">
            {benefits.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card">
                  <Icon className="size-4 text-brand" aria-hidden />
                </div>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <div className="order-1 mx-auto w-full max-w-[420px] lg:order-2">
          <SignInCard />
        </div>
      </div>
    </main>
  )
}
