import type { AgentAction } from '@ui-sdk/react/agent'

type PageControls = {
  navigation?: readonly string[]
  textFields?: readonly string[]
}

const pages: Record<string, PageControls | undefined> = {
  '/': { navigation: ['Toggle Sidebar', 'Home', 'Settings'] },
}

export function allowAgentAction(
  step: AgentAction,
  pathname: string,
  controls = pages[pathname],
): boolean {
  if (step.confirm !== undefined || !step.label || !controls) return false
  if (step.component === 'button' && controls.navigation?.includes(step.label))
    return step.action === 'press' && step.args.length === 0
  if (step.component === 'input' && controls.textFields?.includes(step.label))
    return (
      (step.action === 'focus' && step.args.length === 0) ||
      (step.action === 'setValue' &&
        step.args.length === 1 &&
        typeof step.args[0] === 'string')
    )
  return false
}
