import {
  Bold,
  Highlighter,
  Italic,
  PaintBucket,
  Palette,
  Strikethrough,
  Underline,
} from 'lucide-react'
import { useEditorCommands } from '../../hooks/useEditorCommands'
import {
  BACKGROUND_COLORS,
  HIGHLIGHT_COLORS,
  TEXT_COLORS,
} from '../../utils/colors'
import { cn } from '../../../lib/utils'
import { useEditorFeatures } from '../../context/EditorFeaturesContext'
import { BlockButtons } from './BlockButtons'
import { ColorPicker } from './ColorPicker'
import { HeadingSelector } from './HeadingSelector'
import { HistoryButtons } from './HistoryButtons'
import { ImageButton } from './ImageButton'
import { MediaLibraryButton } from './MediaLibraryButton'
import { LinkButton } from './LinkButton'
import { ListButtons } from './ListButtons'
import { FileButton } from './FileButton'
import { TableButtons } from './TableButtons'
import { DirectionButton } from './DirectionButton'
import { ToolbarButton } from './ToolbarButton'
import { ToolbarExtra } from './ToolbarExtra'
import { ToolbarGroup } from './ToolbarGroup'
import { EmojiPicker } from '../EmojiPicker'

/**
 * Sticky, responsive editor toolbar (tablet + desktop).
 * Sticky pin is applied by the Editor shell (`.omid-toolbar-sticky-top`).
 * Mobile uses MobileToolbar instead.
 */
export function Toolbar({ className, toolbarExtra }) {
  const {
    blockType,
    isBold,
    isItalic,
    isUnderline,
    isStrike,
    textColor,
    highlightColor,
    backgroundColor,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrike,
    setHeading,
    setTextColor,
    setHighlight,
    setBackgroundColor,
    clearTextColor,
    clearHighlight,
    clearBackgroundColor,
  } = useEditorCommands()
  const features = useEditorFeatures()

  return (
    <div
      role="toolbar"
      aria-label="Formatting toolbar"
      className={cn(
        'omid-toolbar',
        'border-b border-[color:var(--editor-border)]',
        'bg-[color:var(--editor-toolbar)] backdrop-blur',
        'animate-[omid-slide-down_180ms_ease]',
        className,
      )}
    >
      <div
        className={cn(
          'omid-toolbar-scroll flex items-center gap-0.5 px-2 py-1.5',
          'overflow-x-auto overscroll-x-contain',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'sm:px-2.5 sm:py-1.5 lg:px-3 lg:py-2',
        )}
      >
        {/* Direction first — always visible, not lost in scroll */}
        <ToolbarGroup label="Direction">
          <DirectionButton />
        </ToolbarGroup>

        <ToolbarGroup label="Text formatting">
          <HeadingSelector value={blockType} onChange={setHeading} />
          <ToolbarButton
            icon={Bold}
            label="Bold"
            active={isBold}
            onClick={toggleBold}
          />
          <ToolbarButton
            icon={Italic}
            label="Italic"
            active={isItalic}
            onClick={toggleItalic}
          />
          <ToolbarButton
            icon={Underline}
            label="Underline"
            active={isUnderline}
            onClick={toggleUnderline}
            className="hidden sm:inline-flex"
          />
          <ToolbarButton
            icon={Strikethrough}
            label="Strikethrough"
            active={isStrike}
            onClick={toggleStrike}
            className="hidden lg:inline-flex"
          />
        </ToolbarGroup>

        <ToolbarGroup label="Color" className="hidden sm:flex">
          <ColorPicker
            icon={Palette}
            label="Text color"
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
            className="hidden lg:block"
          />
          <ColorPicker
            icon={PaintBucket}
            label="Background"
            colors={BACKGROUND_COLORS}
            value={backgroundColor}
            onChange={setBackgroundColor}
            onClear={clearBackgroundColor}
            indicator="dot"
            className="hidden lg:block"
          />
        </ToolbarGroup>

        <ToolbarGroup label="Lists">
          <ListButtons />
        </ToolbarGroup>

        <ToolbarGroup label="Blocks" className="hidden sm:flex">
          <BlockButtons />
        </ToolbarGroup>

        <ToolbarGroup label="Media">
          <LinkButton />
          <ImageButton />
          <MediaLibraryButton />
          {features.files !== false ? (
            <FileButton className="hidden sm:inline-flex" />
          ) : null}
          {features.emoji !== false ? (
            <EmojiPicker className="hidden sm:inline-flex" />
          ) : null}
          <ToolbarExtra items={toolbarExtra} />
        </ToolbarGroup>

        {features.table !== false ? (
          <ToolbarGroup label="Table" className="hidden lg:flex">
            <TableButtons />
          </ToolbarGroup>
        ) : null}

        <ToolbarGroup label="History" showDivider={false}>
          <HistoryButtons />
        </ToolbarGroup>
      </div>
    </div>
  )
}
