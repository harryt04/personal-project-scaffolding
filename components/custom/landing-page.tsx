import Link from 'next/link'
import { ThemeSwitcher } from './themeSwitcher'
import { Button } from '../ui/button'

function LandingPage() {
  return (
    <div>
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="flex max-w-2xl flex-col items-center justify-center">
          <h1 className="text-4xl font-bold"> TrimTech </h1>
          <br />
          <ThemeSwitcher />
          <br />
          <p className="text-l">
            TrimTech is a purpose-built barbershop and salon booking and payment
            collection app. Built by barbers for barbers.
          </p>
          <br />
          <p className="text-l"></p>
          Coming soon.
          <br />
          <br />
          <Button variant={'default'}>
            <Link href="https://forms.gle/grPSfC6ZdT7c2UNi8">
              Join the waitlist here
            </Link>
          </Button>
          <br />
          <br />
          <Button variant={'link'}>
            <Link href="/login">Sign in to the free and open beta</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export { LandingPage }
