'use client'

import { useEffect } from 'react'
import {
  createAgent,
  registerTools,
  type AgentAction,
} from '@ui-sdk/react/agent'
import { allowAgentAction } from '@/lib/agent-policy'

export function AgentBridge() {
  useEffect(() => {
    const allow = (step: AgentAction) =>
      allowAgentAction(step, window.location.pathname)
    return registerTools(createAgent({ allow }), { allow })
  }, [])
  return null
}
