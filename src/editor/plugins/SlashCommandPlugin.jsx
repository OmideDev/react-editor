import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createHeadingNode } from '@lexical/rich-text'
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list'
import { $createCodeNode } from '@lexical/code-core'
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import { $setBlocksType } from '@lexical/selection'
import { mergeRegister } from '@lexical/utils'
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
} from 'lexical'
import {
  CheckSquare,
  Code2,
  Heading1,
  Heading2,
  Image as ImageIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Table2,
} from 'lucide-react'
import { SlashMenu } from '../components/SlashMenu'
import { INSERT_QUOTE_COMMAND, INSERT_DIVIDER_COMMAND } from './BlockPlugin'
import {
  clampIndex,
  filterByQuery,
  getTextUpToCursor,
  matchTrigger,
} from '../utils/typeahead'

export const SLASH_COMMANDS = [
  {
    id: 'h1',
    label: 'Heading 1',
    description: 'Large section heading',
    keywords: 'h1 heading title',
    icon: Heading1,
  },
  {
    id: 'h2',
    label: 'Heading 2',
    description: 'Medium section heading',
    keywords: 'h2 heading subtitle',
    icon: Heading2,
  },
  {
    id: 'bullet',
    label: 'Bullet List',
    description: 'Unordered list',
    keywords: 'ul bullet list',
    icon: List,
  },
  {
    id: 'number',
    label: 'Number List',
    description: 'Ordered list',
    keywords: 'ol number ordered',
    icon: ListOrdered,
  },
  {
    id: 'check',
    label: 'Checklist',
    description: 'Todo checklist',
    keywords: 'todo check checklist',
    icon: CheckSquare,
  },
  {
    id: 'quote',
    label: 'Quote',
    description: 'Block quote',
    keywords: 'quote blockquote',
    icon: Quote,
  },
  {
    id: 'divider',
    label: 'Divider',
    description: 'Horizontal rule',
    keywords: 'hr divider line',
    icon: Minus,
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Upload or insert image',
    keywords: 'image photo picture',
    icon: ImageIcon,
  },
  {
    id: 'table',
    label: 'Table',
    description: 'Insert 3×3 table',
    keywords: 'table grid',
    icon: Table2,
  },
  {
    id: 'code',
    label: 'Code Block',
    description: 'Fenced code block',
    keywords: 'code pre block',
    icon: Code2,
  },
]

function $removeTriggerText(match) {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return false
  const { node } = getTextUpToCursor(selection)
  if (!$isTextNode(node)) return false

  const start = match.triggerIndex
  const end = selection.anchor.offset
  selection.setTextNodeRange(node, start, node, end)
  selection.removeText()
  return true
}

/**
 * Slash command menu triggered by `/`.
 */
export function SlashCommandPlugin({
  commands = SLASH_COMMANDS,
  enabled = true,
  onOpenImageUploader,
}) {
  const [editor] = useLexicalComposerContext()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [menuStyle, setMenuStyle] = useState(null)
  const [match, setMatch] = useState(null)
  const listId = useId()

  const filtered = useMemo(
    () =>
      filterByQuery(
        commands,
        query,
        (item) =>
          `${item.label} ${item.keywords || ''} ${item.description || ''}`,
      ),
    [commands, query],
  )

  useEffect(() => {
    setActiveIndex(0)
  }, [query, open])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setMatch(null)
    setMenuStyle(null)
  }, [])

  const runCommand = useCallback(
    (item) => {
      if (!item || !match) return

      editor.update(() => {
        $removeTriggerText(match)

        if (item.id === 'h1') {
          $setBlocksType($getSelection(), () => $createHeadingNode('h1'))
        } else if (item.id === 'h2') {
          $setBlocksType($getSelection(), () => $createHeadingNode('h2'))
        } else if (item.id === 'code') {
          $setBlocksType($getSelection(), () => $createCodeNode())
        }
      })

      if (item.id === 'bullet') {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
      } else if (item.id === 'number') {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
      } else if (item.id === 'check') {
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
      } else if (item.id === 'quote') {
        editor.dispatchCommand(INSERT_QUOTE_COMMAND, undefined)
      } else if (item.id === 'divider') {
        editor.dispatchCommand(INSERT_DIVIDER_COMMAND, undefined)
      } else if (item.id === 'table') {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
          rows: '3',
          columns: '3',
          includeHeaders: true,
        })
      } else if (item.id === 'image') {
        onOpenImageUploader?.()
      }

      close()
    },
    [close, editor, match, onOpenImageUploader],
  )

  useEffect(() => {
    if (!enabled) return undefined

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          if (open) close()
          return
        }

        const { text } = getTextUpToCursor(selection)
        const nextMatch = matchTrigger(text, '/')
        if (!nextMatch) {
          if (open) close()
          return
        }

        setMatch(nextMatch)
        setQuery(nextMatch.query)
        setOpen(true)

        const nativeSel = window.getSelection()
        if (nativeSel && nativeSel.rangeCount > 0) {
          const rect = nativeSel.getRangeAt(0).getBoundingClientRect()
          setMenuStyle({
            position: 'fixed',
            top: rect.bottom + 6,
            left: Math.min(
              Math.max(8, rect.left),
              window.innerWidth - 300,
            ),
            zIndex: 85,
          })
        }
      })
    })
  }, [close, editor, enabled, open])

  useEffect(() => {
    if (!open || !enabled) return undefined

    return mergeRegister(
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        (event) => {
          event.preventDefault()
          setActiveIndex((i) => clampIndex(i + 1, filtered.length))
          return true
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        (event) => {
          event.preventDefault()
          setActiveIndex((i) => clampIndex(i - 1, filtered.length))
          return true
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          if (!filtered[activeIndex]) return false
          event.preventDefault()
          runCommand(filtered[activeIndex])
          return true
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        (event) => {
          event.preventDefault()
          close()
          return true
        },
        COMMAND_PRIORITY_HIGH,
      ),
    )
  }, [activeIndex, close, editor, enabled, filtered, open, runCommand])

  if (!enabled || !open || !menuStyle) return null

  return createPortal(
    <SlashMenu
      items={filtered}
      activeIndex={activeIndex}
      query={query}
      style={menuStyle}
      listId={listId}
      onHover={setActiveIndex}
      onSelect={runCommand}
    />,
    document.body,
  )
}
