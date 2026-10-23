import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/signin')({
  component: SignIn,
})

function SignIn() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function github() {
    setPending(true)
    setError(null)
    const { error } = await signIn.social({
      provider: 'github',
      callbackURL: `${window.location.origin}/`,
    })
    if (error) {
      setPending(false)
      setError(error.message ?? "GitHub sign-in isn't available right now.")
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight">
        Sign in to practise
      </h1>
      <p className="mt-3 text-sm text-ink-2">
        Your drafts and practice record are saved to your account.
      </p>
      {error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-fail-soft px-3 py-2 text-sm text-fail"
        >
          {error}
        </p>
      )}
      <Button
        size="lg"
        className="mt-8 h-12 w-full"
        disabled={pending}
        onClick={github}
      >
        {pending ? 'Redirecting to GitHub…' : 'Continue with GitHub'}
      </Button>
      <p className="mt-4 text-xs text-muted-foreground">
        We read your public profile and primary email. Nothing is posted to
        GitHub.
      </p>
      {import.meta.env.DEV && <DevEmailSignIn onError={setError} />}
    </main>
  )
}

/** Local development only; the API enables email/password outside production. */
function DevEmailSignIn({
  onError,
}: {
  onError: (message: string | null) => void
}) {
  const router = useRouter()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')

  async function submit(form: FormData) {
    onError(null)
    const email = String(form.get('email'))
    const password = String(form.get('password'))
    const { error } =
      mode === 'sign-up'
        ? await authClient.signUp.email({
            email,
            password,
            name: email.split('@')[0],
          })
        : await signIn.email({ email, password })
    if (error) return onError(error.message ?? 'Sign-in failed.')
    router.navigate({ to: '/' })
  }

  return (
    <form action={submit} className="mt-10 space-y-3 border-t border-rule pt-6">
      <p className="text-xs font-semibold text-muted-foreground">
        Development only: email and password
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={
            mode === 'sign-up' ? 'new-password' : 'current-password'
          }
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="outline">
          {mode === 'sign-up' ? 'Create account' : 'Sign in'}
        </Button>
        <Button
          type="button"
          variant="link"
          onClick={() => setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')}
        >
          {mode === 'sign-up'
            ? 'I have an account'
            : 'Create an account instead'}
        </Button>
      </div>
    </form>
  )
}
