import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <p className="text-lg font-medium">
        Welcome, {session!.user.name || session!.user.email}
      </p>
    </div>
  )
}
