'use client'
import type { StyledProps } from './part-props'

import * as React from 'react'
import * as Parts from '@ui-sdk/react/resizable'
import { GripVertical } from 'lucide-react'

import { cn } from '@/lib/utils'

type ResizablePanelGroupProps = StyledProps<typeof Parts.Resizable> & {
  /** shadcn's name for `orientation`. */
  direction?: 'horizontal' | 'vertical'
}

function ResizablePanelGroup({
  className,
  direction,
  orientation,
  ...props
}: ResizablePanelGroupProps) {
  return (
    <Parts.Resizable
      orientation={orientation ?? direction}
      className={cn(
        'flex h-full w-full data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

const ResizablePanel = Parts.ResizablePanel

function ResizableHandle({
  withHandle,
  className,
  ...props
}: StyledProps<typeof Parts.ResizableHandle> & {
  withHandle?: boolean
}) {
  return (
    <Parts.ResizableHandle
      className={cn(
        'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:h-1 data-[orientation=vertical]:after:w-full data-[orientation=vertical]:after:-translate-y-1/2 data-[orientation=vertical]:after:translate-x-0 [&[data-orientation=vertical]>div]:rotate-90',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      )}
    </Parts.ResizableHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
