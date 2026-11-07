'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

const analyticsKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const runningInProduction =
  process.env.NODE_ENV === 'production' &&
  typeof window !== 'undefined' &&
  !!analyticsKey
if (runningInProduction && analyticsKey) {
  posthog.init(analyticsKey, {
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
  })
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathName = usePathname()

  useEffect(() => {
    if (!runningInProduction) {
      return
    }
    posthog.capture('$pageview', { pathName })
  }, [pathName])

  if (!runningInProduction) {
    return <>{children}</> // Don't send events in dev mode
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}
