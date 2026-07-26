import { cn } from '../../lib/utils'
import { useTheme } from '../hooks/useTheme'

/**
 * Floating slash-command menu.
 */
export function SlashMenu({
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
      aria-label="Slash commands"
      style={{ ...style, ...themeStyle }}
      className={cn(
        'omid-slash-menu omid-popover-surface z-[85] w-[min(100vw-1.5rem,18rem)]',
        'max-h-72 overflow-y-auto rounded-xl p-1.5 shadow-xl',
      )}
    >
      <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--editor-muted)]">
        {query ? `Commands · ${query}` : 'Commands'}
      </p>
      {items.length === 0 ? (
        <p className="px-2 py-3 text-sm text-[color:var(--editor-muted)]">
          No commands found
        </p>
      ) : (
        items.map((item, index) => {
          const Icon = item.icon
          const active = index === activeIndex
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={active}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm',
                'transition-colors duration-150',
                active
                  ? 'bg-[color:var(--editor-hover)] text-[color:var(--editor-text)]'
                  : 'text-[color:var(--editor-text)] hover:bg-[color:var(--editor-hover)]',
              )}
              onMouseEnter={() => onHover?.(index)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect?.(item)}
            >
              {Icon ? (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--editor-surface)]">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
              ) : null}
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{item.label}</span>
                {item.description ? (
                  <span className="block truncate text-xs text-[color:var(--editor-muted)]">
                    {item.description}
                  </span>
                ) : null}
              </span>
            </button>
          )
        })
      )}
    </div>
  )
}
