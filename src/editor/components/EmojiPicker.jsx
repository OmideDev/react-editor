import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import { Smile, Search } from 'lucide-react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection } from 'lexical'
import { cn } from '../../lib/utils'
import { useTheme } from '../hooks/useTheme'
import { EMOJI_CATEGORIES, searchEmojis } from '../utils/emoji'

/**
 * Emoji picker button + searchable category grid.
 */
export function EmojiPicker({ className }) {
  const [editor] = useLexicalComposerContext()
  const { style: themeStyle } = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(EMOJI_CATEGORIES[0].id)
  const listId = useId()
  const inputRef = useRef(null)

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss])

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 20)
      return () => window.clearTimeout(t)
    }
    setQuery('')
    return undefined
  }, [open])

  const emojis = useMemo(() => {
    if (query.trim()) return searchEmojis(query)
    const cat = EMOJI_CATEGORIES.find((c) => c.id === category)
    return (cat?.emojis || []).map((emoji) => ({ emoji, category }))
  }, [category, query])

  const insertEmoji = (emoji) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selection.insertText(emoji)
      }
    })
    setOpen(false)
  }

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        aria-label="Emoji"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'omid-toolbar-btn inline-flex h-8 w-8 items-center justify-center rounded-lg',
          'text-[color:var(--editor-muted)] transition-all duration-150',
          'hover:bg-[color:var(--editor-hover)] hover:text-[color:var(--editor-text)]',
          open && 'bg-[color:var(--editor-hover)]',
          className,
        )}
        {...getReferenceProps({
          onClick: () => setOpen((v) => !v),
          onMouseDown: (e) => e.preventDefault(),
        })}
      >
        <Smile className="h-4 w-4" strokeWidth={2} />
      </button>

      {open
        ? createPortal(
            <div
              ref={refs.setFloating}
              id={listId}
              role="dialog"
              aria-label="Emoji picker"
              style={{ ...floatingStyles, ...themeStyle }}
              className="omid-popover-surface z-[90] w-[min(100vw-1.5rem,20rem)] rounded-xl p-2 shadow-xl"
              {...getFloatingProps()}
            >
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--editor-muted)]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search emoji"
                  className="w-full rounded-lg border border-[color:var(--editor-border)] bg-[color:var(--editor-bg)] py-1.5 pl-7 pr-2 text-xs outline-none"
                />
              </div>

              {!query.trim() ? (
                <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
                  {EMOJI_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={cn(
                        'shrink-0 rounded-md px-2 py-1 text-[11px] font-medium',
                        category === cat.id
                          ? 'bg-[color:var(--editor-active)] text-[color:var(--editor-active-text)]'
                          : 'text-[color:var(--editor-muted)] hover:bg-[color:var(--editor-hover)]',
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="grid max-h-48 grid-cols-8 gap-0.5 overflow-y-auto">
                {emojis.map((item) => (
                  <button
                    key={`${item.category}-${item.emoji}`}
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-base hover:bg-[color:var(--editor-hover)]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertEmoji(item.emoji)}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
