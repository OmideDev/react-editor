import { cn } from '../../../lib/utils'

/**
 * Visual group for related toolbar controls with theme-aware separators.
 */
export function ToolbarGroup({
  children,
  label,
  className,
  showDivider = true,
  compact = false,
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'omid-toolbar-group relative flex shrink-0 items-center gap-0.5',
        compact && 'gap-0',
        showDivider &&
          'after:mx-1 after:h-5 after:w-px after:shrink-0 after:bg-[color:var(--editor-border)] after:content-[""] last:after:hidden sm:after:mx-1.5',
        className,
      )}
    >
      {children}
    </div>
  )
}
