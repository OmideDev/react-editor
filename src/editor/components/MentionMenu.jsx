import { cn } from '../../lib/utils'
import { useTheme } from '../hooks/useTheme'

/**
 * Mention suggestion menu (@users).
 */
export function MentionMenu({
  items = [],
  activeIndex = 0,
  query = '',
  style,
  onSelect,
  onHover,
  listId,
}) {
  const { style: themeStyle } = useTheme()

  return (
    <div
      id={listId}
      role="listbox"
      aria-label="Mentions"
      style={{ ...style, ...themeStyle }}
      className={cn(
        'omid-mention-menu omid-popover-surface z-[85] w-[min(100vw-1.5rem,16rem)]',
        'max-h-64 overflow-y-auto rounded-xl p-1.5 shadow-xl',
      )}
    >
      <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--editor-muted)]">
        {query ? `People · ${query}` : 'People'}
      </p>
      {items.length === 0 ? (
        <p className="px-2 py-3 text-sm text-[color:var(--editor-muted)]">
          No users found
        </p>
      ) : (
        items.map((user, index) => {
          const active = index === activeIndex
          return (
            <button
              key={user.id ?? user.username}
              type="button"
              role="option"
              aria-selected={active}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm',
                'transition-colors duration-150',
                active
                  ? 'bg-[color:var(--editor-hover)]'
                  : 'hover:bg-[color:var(--editor-hover)]',
              )}
              onMouseEnter={() => onHover?.(index)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect?.(user)}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--editor-active)] text-xs font-semibold text-[color:var(--editor-active-text)]">
                {(user.name || user.username || '?').slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-[color:var(--editor-text)]">
                  {user.name || user.username}
                </span>
                <span className="block truncate text-xs text-[color:var(--editor-muted)]">
                  @{user.username}
                </span>
              </span>
            </button>
          )
        })
      )}
    </div>
  )
}
