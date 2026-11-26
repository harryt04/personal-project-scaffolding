import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { allowAgentAction } from './agent-policy'
import type { AgentAction } from '@ui-sdk/react/agent'

const home: AgentAction = {
  ref: 'c1',
  component: 'button',
  label: 'Home',
  action: 'press',
  args: [],
}

test('only exact navigation controls accept a direct press on their own route', () => {
  assert.ok(allowAgentAction(home, '/'))
  for (const label of [
    'Delete',
    'Sign out',
    'Pay',
    'Change theme',
    'Home settings',
  ]) {
    assert.equal(allowAgentAction({ ...home, label }, '/'), false)
  }
  for (const change of [
    { args: ['Delete'] },
    { confirm: '' },
    { action: 'setValue' },
    { component: 'menu' },
  ]) {
    assert.equal(allowAgentAction({ ...home, ...change }, '/'), false)
  }
  assert.equal(allowAgentAction(home, '/settings'), false)
})

test('ordinary fields require explicit registration and a string value', () => {
  const step = {
    ...home,
    component: 'input',
    label: 'Search',
    action: 'setValue',
    args: ['sample'],
  }
  const controls = { textFields: ['Search'] }
  assert.ok(allowAgentAction(step, '/search', controls))
  assert.ok(
    allowAgentAction(
      { ...step, action: 'focus', args: [] },
      '/search',
      controls,
    ),
  )
  for (const change of [
    { label: 'Password' },
    { confirm: 'Personal data' },
    { args: [123] },
    { args: ['one', 'two'] },
  ]) {
    assert.equal(
      allowAgentAction({ ...step, ...change }, '/search', controls),
      false,
    )
  }
  assert.equal(allowAgentAction(step, '/login'), false)
})
