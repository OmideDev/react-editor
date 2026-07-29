import { useCallback, useEffect, useImperativeHandle } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { INSERT_IMAGE_COMMAND } from '../nodes/ImageNode'
import { normalizeImageAlign } from '../nodes/ImageNode'

/**
 * Normalize host payloads: `{ url, alt }` or Lexical-style `{ src, altText }`.
 */
export function normalizeInsertImagePayload(payload = {}) {
  const src = payload.url ?? payload.src
  if (!src) return null

  return {
    src,
    altText: payload.alt ?? payload.altText ?? payload.title ?? '',
    width: payload.width ?? 'inherit',
    height: payload.height ?? 'inherit',
    caption: payload.caption || '',
    align: normalizeImageAlign(payload.align),
  }
}

/**
 * Exposes imperative insert APIs on the Editor ref (and optional ready callback).
 */
export function EditorApiPlugin({ apiRef, onReady }) {
  const [editor] = useLexicalComposerContext()

  const insertImage = useCallback(
    (payload) => {
      const normalized = normalizeInsertImagePayload(payload)
      if (!normalized) return false
      return editor.dispatchCommand(INSERT_IMAGE_COMMAND, normalized)
    },
    [editor],
  )

  const api = useCallback(
    () => ({
      insertImage,
      getEditor: () => editor,
      focus: () => {
        editor.focus()
      },
    }),
    [editor, insertImage],
  )

  useImperativeHandle(apiRef, api, [api])

  useEffect(() => {
    onReady?.(api())
  }, [api, onReady])

  return null
}
