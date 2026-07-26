import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import {
  Bold,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  MoreHorizontal,
  PaintBucket,
  Palette,
  Quote,
  Minus,
} from 'lucide-react'
import { useEditorCommands } from '../hooks/useEditorCommands'
import { useTheme } from '../hooks/useTheme'
import {
  BACKGROUND_COLORS,
  HIGHLIGHT_COLORS,
  TEXT_COLORS,
} from '../utils/colors'
import { cn } from '../../lib/utils'
import { ColorPicker } from './Toolbar/ColorPicker'
import { ToolbarButton } from './Toolbar/ToolbarButton'
import { LinkButton } from './Toolbar/LinkButton'
import { ImageButton } from './Toolbar/ImageButton'
import { DirectionButton } from './Toolbar/DirectionButton'

/**
 * Compact sticky mobile toolbar with a "More" overflow menu.
 */
export function MobileToolbar({
  className,
  sticky = 'bottom',
}) {
  const {
    isBold,
    isItalic,
    textColor,
    highlightColor,
    backgroundColor,
    toggleBold,
    toggleItalic,
    toggleBulletList,
    toggleNumberList,
    toggleQuote,
    insertDivider,
    setTextColor,
    setHighlight,
    setBackgroundColor,
    clearTextColor,
    clearHighlight,
    clearBackgroundColor,
  } = useEditorCommands()
  const { style: themeStyle } = useTheme()

  const [moreOpen, setMoreOpen] = useState(false)
  const moreBtnRef = useRef(null)
  const menuId = useId()

  const { refs, floatingStyles, context } = useFloating({
    open: moreOpen,
    onOpenChange: setMoreOpen,
    placement: sticky === 'bottom' ? 'top-end' : 'bottom-end',
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'menu' })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    dismiss,
    role,
  ])

  useEffect(() => {
    if (!moreOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setMoreOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [moreOpen])

  return (
    <div
      role="toolbar"
      aria-label="Mobile formatting toolbar"
      className={cn(
        'omid-mobile-toolbar omid-toolbar',
        sticky === 'bottom' && 'sticky bottom-0 z-20 mt-auto border-t',
        sticky === 'top' && 'sticky top-0 z-20 border-b',
        'border-[color:var(--editor-border)] bg-[color:var(--editor-toolbar)] backdrop-blur',
        'animate-[omid-slide-up_180ms_ease]',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-2',
          'overflow-x-auto overscroll-x-contain',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        <DirectionButton className="h-10 min-w-[3.25rem] px-2" />

        <span
          aria-hidden="true"
          className="mx-1 h-6 w-px shrink-0 bg-[color:var(--editor-border)]"
        />

        <ToolbarButton
          icon={Bold}
          label="Bold"
          active={isBold}
          onClick={toggleBold}
          className="h-10 w-10"
        />
        <ToolbarButton
          icon={Italic}
          label="Italic"
          active={isItalic}
          onClick={toggleItalic}
          className="h-10 w-10"
        />
        <LinkButton className="h-10 w-10" />
        <ImageButton className="h-10 w-10" />

        <span
          aria-hidden="true"
          className="mx-1 h-6 w-px shrink-0 bg-[color:var(--editor-border)]"
        />

        <button
          ref={(node) => {
            moreBtnRef.current = node
            refs.setReference(node)
          }}
          type="button"
          aria-label="More actions"
          aria-haspopup="menu"
          aria-expanded={moreOpen}
          aria-controls={menuId}
          className={cn(
            'omid-toolbar-btn inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            'text-[color:var(--editor-text)] transition-all duration-150',
            'hover:bg-[color:var(--editor-hover)]',
            'active:scale-95',
            moreOpen && 'bg-[color:var(--editor-hover)]',
          )}
          {...getReferenceProps({
            onClick: () => setMoreOpen((v) => !v),
          })}
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {moreOpen
        ? createPortal(
            <div
              ref={refs.setFloating}
              id={menuId}
              role="menu"
              style={{ ...floatingStyles, ...themeStyle }}
              className={cn(
                'omid-mobile-more omid-popover-surface z-[80] w-56 overflow-hidden rounded-xl p-1.5',
              )}
              {...getFloatingProps()}
            >
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--editor-muted)]">
                More
              </p>

              <div className="flex flex-wrap gap-1 px-1 pb-2">
                <ColorPicker
                  icon={Palette}
                  label="Colors"
                  colors={TEXT_COLORS}
                  value={textColor}
                  onChange={setTextColor}
                  onClear={clearTextColor}
                />
                <ColorPicker
                  icon={Highlighter}
                  label="Highlight"
                  colors={HIGHLIGHT_COLORS}
                  value={highlightColor}
                  onChange={setHighlight}
                  onClear={clearHighlight}
                  indicator="dot"
                />
                <ColorPicker
                  icon={PaintBucket}
                  label="Background"
                  colors={BACKGROUND_COLORS}
                  value={backgroundColor}
                  onChange={setBackgroundColor}
                  onClear={clearBackgroundColor}
                  indicator="dot"
                />
              </div>

              <div className="my-1 h-px bg-[color:var(--editor-border)]" />

              <button
                type="button"
                role="menuitem"
                className="omid-mobile-more-item"
                onClick={() => {
                  toggleBulletList()
                  setMoreOpen(false)
                }}
              >
                <List className="h-4 w-4" />
                Bullet list
              </button>
              <button
                type="button"
                role="menuitem"
                className="omid-mobile-more-item"
                onClick={() => {
                  toggleNumberList()
                  setMoreOpen(false)
                }}
              >
                <ListOrdered className="h-4 w-4" />
                Numbered list
              </button>
              <button
                type="button"
                role="menuitem"
                className="omid-mobile-more-item"
                onClick={() => {
                  toggleQuote()
                  setMoreOpen(false)
                }}
              >
                <Quote className="h-4 w-4" />
                Quote
              </button>
              <button
                type="button"
                role="menuitem"
                className="omid-mobile-more-item"
                onClick={() => {
                  insertDivider()
                  setMoreOpen(false)
                }}
              >
                <Minus className="h-4 w-4" />
                Divider
              </button>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
