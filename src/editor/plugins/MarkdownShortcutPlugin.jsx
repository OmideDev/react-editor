import { MarkdownShortcutPlugin as LexicalMarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import {
  TRANSFORMERS,
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  CHECK_LIST,
  CODE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
} from '@lexical/markdown'

/** Transformers matching Phase 14 markdown shortcut requirements. */
export const OMID_MARKDOWN_TRANSFORMERS = [
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  CHECK_LIST,
  CODE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
]

/**
 * Auto-converts markdown shortcuts while typing.
 */
export function MarkdownShortcutPlugin({
  transformers = OMID_MARKDOWN_TRANSFORMERS,
  enabled = true,
}) {
  if (!enabled) return null
  return <LexicalMarkdownShortcutPlugin transformers={transformers} />
}

export { TRANSFORMERS }
