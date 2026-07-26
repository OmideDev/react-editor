import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
} from 'lexical'
import { MentionMenu } from '../components/MentionMenu'
import { $createMentionNode } from '../nodes/MentionNode'
import {
  clampIndex,
  filterByQuery,
  getTextUpToCursor,
  matchTrigger,
} from '../utils/typeahead'

function $removeTriggerText(match) {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return false
  const { node } = getTextUpToCursor(selection)
  if (!$isTextNode(node)) return false

  selection.setTextNodeRange(node, match.triggerIndex, node, selection.anchor.offset)
  selection.removeText()
  return true
}

/**
 * @mention typeahead plugin.
 */
export function MentionPlugin({ mentions = [], enabled = true }) {
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
        mentions,
        query,
        (user) => `${user.name || ''} ${user.username || ''}`,
      ),
    [mentions, query],
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

  const selectUser = useCallback(
    (user) => {
      if (!user || !match) return

      editor.update(() => {
        $removeTriggerText(match)
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return

        const mentionNode = $createMentionNode({
          id: user.id,
          username: user.username,
          name: user.name,
        })
        selection.insertNodes([mentionNode, $createTextNode(' ')])
      })

      close()
    },
    [close, editor, match],
  )

  useEffect(() => {
    if (!enabled || !mentions?.length) return undefined

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          if (open) close()
          return
        }

        const { text } = getTextUpToCursor(selection)
        const nextMatch = matchTrigger(text, '@')
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
            left: Math.min(Math.max(8, rect.left), window.innerWidth - 280),
            zIndex: 85,
          })
        }
      })
    })
  }, [close, editor, enabled, mentions, open])

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
          selectUser(filtered[activeIndex])
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
  }, [activeIndex, close, editor, enabled, filtered, open, selectUser])

  if (!enabled || !open || !menuStyle || !mentions?.length) return null

  return createPortal(
    <MentionMenu
      items={filtered}
      activeIndex={activeIndex}
      query={query}
      style={menuStyle}
      listId={listId}
      onHover={setActiveIndex}
      onSelect={selectUser}
    />,
    document.body,
  )
}
