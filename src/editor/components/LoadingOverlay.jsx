import { cn } from '../../lib/utils'

/**
 * Full-surface loading overlay for initial load, uploads, and async work.
 */
export function LoadingOverlay({
  loading = false,
  label = 'Loading…',
  className,
}) {
  if (!loading) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'omid-loading-overlay absolute inset-0 z-40',
        'flex flex-col items-center justify-center gap-3',
        'bg-[color:color-mix(in_srgb,var(--editor-bg)_78%,transparent)]',
        'backdrop-blur-[2px]',
        'animate-[omid-fade-in_160ms_ease]',
        className,
      )}
    >
      <span className="omid-spinner" aria-hidden="true" />
      <span className="text-sm font-medium text-[color:var(--editor-muted)]">
        {label}
      </span>
    </div>
  )
}
