import {
  Bold,
  FileText,
  FolderOpen,
  Highlighter,
  Image as ImageIcon,
  Images,
  Italic,
  Link as LinkIcon,
  PaintBucket,
  Palette,
  Smile,
  Strikethrough,
  Table2,
  Underline,
  Video,
} from 'lucide-react'
import { ToolbarButton } from './ToolbarButton'

const ICON_MAP = {
  Bold,
  FileText,
  FolderOpen,
  Highlighter,
  Image: ImageIcon,
  Images,
  Italic,
  Link: LinkIcon,
  PaintBucket,
  Palette,
  Smile,
  Strikethrough,
  Table: Table2,
  Underline,
  Video,
}

function resolveIcon(icon) {
  if (!icon) return null
  if (typeof icon === 'string') return ICON_MAP[icon] || Images
  return icon
}

/**
 * Renders host-injected toolbar actions.
 *
 * @param {{ items?: Array<{ id: string, icon?: string|Component, label?: string, onClick?: () => void, active?: boolean }> }} props
 */
export function ToolbarExtra({ items, className }) {
  if (!items?.length) return null

  return (
    <>
      {items.map((item) => {
        if (!item || !item.id) return null
        const Icon = resolveIcon(item.icon)
        return (
          <ToolbarButton
            key={item.id}
            icon={Icon || Images}
            label={item.label || item.id}
            active={Boolean(item.active)}
            onClick={() => item.onClick?.()}
            className={className}
          />
        )
      })}
    </>
  )
}
