import * as React from 'react'
import { renderElement } from '@ui-sdk/react/primitive'

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  ref?: React.Ref<HTMLElement>
}

/**
 * Renders its single child element with these props merged in, for the
 * shadcn `asChild` pattern on layout pieces that have no UI SDK part.
 *
 * Built on UI SDK's `renderElement`, so it merges exactly as a part's
 * `render` prop does: the child's props win, class names, styles and refs
 * combine, and both event handlers run (the child's first). A lazy child,
 * which Next can pass from a Server Component, is resolved. Anything that is
 * not a single element renders nothing.
 */
function Slot({ children, ...props }: SlotProps) {
  if (typeof children !== 'object' || children === null) return null
  if (Array.isArray(children)) return null
  return renderElement('span', props, children as React.ReactElement)
}

export { Slot }
