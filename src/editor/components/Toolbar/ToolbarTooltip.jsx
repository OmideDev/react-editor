import { useState } from 'react'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import { cn } from '../../../lib/utils'

/**
 * Floating UI tooltip used by toolbar controls.
 */
export function ToolbarTooltip({
  label,
  children,
  disabled = false,
  placement = 'bottom',
}) {
  const [open, setOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: open && !disabled && Boolean(label),
    onOpenChange: setOpen,
    placement,
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const hover = useHover(context, { move: false, delay: { open: 280, close: 0 } })
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ])

  return (
    <>
      <span
        ref={refs.setReference}
        className="inline-flex"
        {...getReferenceProps()}
      >
        {children}
      </span>
      {open && !disabled && label ? (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className={cn(
            'omid-tooltip z-[90] pointer-events-none',
            'whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium',
            'bg-[color:var(--editor-active)] text-[color:var(--editor-active-text)]',
            'shadow-md animate-[omid-fade-in_150ms_ease]',
          )}
          {...getFloatingProps()}
        >
          {label}
        </div>
      ) : null}
    </>
  )
}
