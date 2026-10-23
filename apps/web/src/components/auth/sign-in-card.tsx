import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogoMark } from '@/components/logo'
import { authClient, signIn, useSession } from '@/lib/auth-client'

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  )
}

export function SignInCard() {
  const { data: session } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function github() {
    setPending(true)
    setError(null)
    try {
      const { error } = await signIn.social({
        provider: 'github',
        callbackURL: `${window.location.origin}/dashboard`,
      })
      if (error) {
        setPending(false)
        setError(error.message ?? "GitHub sign-in isn't available right now. Try again in a moment.")
      }
    } catch {
      setPending(false)
      setError("Couldn't reach the sign-in server. Check your connection and try again.")
    }
  }

  return (
    <div className="w-full rounded-lg border bg-card p-6 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.18)] sm:p-8">
      <LogoMark className="size-9" />
      <h1 className="mt-5 text-2xl font-bold tracking-tight">Sign in to HookDrill</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Use your GitHub account. New here? The same button creates your account.</p>

      {session?.user && (
        <Link
          to="/dashboard"
          className="mt-5 flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2.5 text-sm transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span>
            Signed in as <span className="font-semibold">{session.user.name}</span>
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-brand">
            Dashboard <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </Link>
      )}

      {error && (
        <div className="mt-5">
          <ErrorMessage message={error} />
        </div>
      )}

      <Button
        size="lg"
        className="mt-6 h-11 w-full bg-foreground text-background hover:bg-foreground/90"
        disabled={pending}
        onClick={github}
      >
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : <GitHubMark className="size-4" />}
        {pending ? 'Redirecting to GitHub…' : 'Continue with GitHub'}
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">
        We read your public profile and primary email. Nothing is posted to GitHub.
      </p>

      {import.meta.env.DEV && <DevEmailSignIn />}
    </div>
  )
}

/** Local development only; the API enables email/password outside production. */
function DevEmailSignIn() {
  const router = useRouter()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))
    setError(null)
    setPending(true)
    try {
      const { error } =
        mode === 'sign-up'
          ? await authClient.signUp.email({ email, password, name: email.split('@')[0] })
          : await signIn.email({ email, password })
      if (error) {
        setError(error.message ?? (mode === 'sign-up' ? "Couldn't create the account." : 'Sign-in failed.'))
        return
      }
      await router.navigate({ to: '/dashboard' })
    } catch {
      setError("Couldn't reach the API. Is it running?")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mt-7">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="rounded-full border border-dashed px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          Development only
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={submit} className="mt-5 space-y-3">
        {error && <ErrorMessage message={error} />}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
          />
        </div>
        <Button type="submit" variant="outline" className="w-full" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          {mode === 'sign-up' ? 'Create account' : 'Sign in with email'}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {mode === 'sign-up' ? 'Already have an account?' : 'No local account yet?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')
              setError(null)
            }}
            className="rounded-sm font-medium text-brand underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {mode === 'sign-up' ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </form>
    </div>
  )
}
