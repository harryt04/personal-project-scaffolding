import { LoginCard } from '@/components/custom/login-card'
import { cn } from '@/lib/utils'

export default function Login() {
  return (
    <main
      className={cn(
        'align-center flex h-screen items-center justify-center bg-background',
      )}
    >
      <LoginCard />
    </main>
  )
}
