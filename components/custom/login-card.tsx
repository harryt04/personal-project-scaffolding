'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, signUp } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function LoginCard() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (isSignUp) {
      const { error: signUpError } = await signUp.email({
        email,
        password,
        name,
        callbackURL: '/',
      })
      if (signUpError) {
        setError(signUpError.message ?? 'Sign up failed.')
      } else {
        router.push('/')
      }
    } else {
      const { error: signInError } = await signIn.email({
        email,
        password,
        callbackURL: '/',
      })
      if (signInError) {
        setError(signInError.message ?? 'Sign in failed.')
      } else {
        router.push('/')
      }
    }

    setLoading(false)
  }

  return (
    <Card className={cn('flex w-full max-w-sm flex-col gap-6 p-8')}>
      <h1 className="text-center text-2xl font-bold">
        {isSignUp ? 'Create an account' : 'Sign in'}
      </h1>

      <form
        data-agent-secret
        data-agent-confirm="Authentication"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        {isSignUp && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onValueChange={setName}
              required
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onValueChange={setEmail}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onValueChange={setPassword}
            required
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Loading…' : isSignUp ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 align-baseline font-normal text-muted-foreground underline hover:text-foreground"
          onClick={() => {
            setError(null)
            setIsSignUp(!isSignUp)
          }}
        >
          {isSignUp ? 'Sign in' : 'Sign up'}
        </Button>
      </p>
    </Card>
  )
}

export { LoginCard }
