import { Link } from '@tanstack/react-router'
import { LogIn } from 'lucide-react'
import { LogoMark } from '@/components/logo'
import { Button } from '@/components/ui/button'

/** Shown in place of personal pages when there is no session. */
export function SignInPrompt({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto grid min-h-[calc(100dvh-3.5rem)] max-w-[1440px] place-items-center px-4 py-12 md:px-6">
      <div className="flex w-full max-w-md flex-col items-center rounded-lg border bg-card px-6 py-10 text-center">
        <LogoMark className="size-10" />
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-balance">
          {title}
        </h1>
        <p className="mt-2 text-sm text-pretty text-muted-foreground">{body}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/signin">
              <LogIn />
              Sign in
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/problems">Browse problems</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
