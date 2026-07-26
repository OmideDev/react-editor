import { useCallback, useMemo } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEditorCommands } from './useEditorCommands'
import { useEditorValue } from './useEditorValue'
import { useTheme } from './useTheme'
import { exportEditorValue, exportHTML, exportJSON } from '../utils/export'
import {
  importEditorValue,
  importHTML,
  importJSON,
} from '../utils/import'

/**
 * Primary public hook for interacting with the editor instance.
 * Must be used under Editor / EditorProvider.
 */
export function useEditor(options = {}) {
  const [editor] = useLexicalComposerContext()
  const commands = useEditorCommands()
  const valueApi = useEditorValue(options)
  const theme = useTheme()

  const getJSON = useCallback(() => exportJSON(editor), [editor])
  const getHTML = useCallback(() => exportHTML(editor), [editor])
  const getValue = useCallback(() => exportEditorValue(editor), [editor])

  const setValue = useCallback(
    (next) => {
      importEditorValue(editor, next)
    },
    [editor],
  )

  const setJSON = useCallback(
    (json) => {
      importJSON(editor, json)
    },
    [editor],
  )

  const setHTML = useCallback(
    (html) => {
      importHTML(editor, html)
    },
    [editor],
  )

  return useMemo(
    () => ({
      editor,
      ...commands,
      json: valueApi.json,
      html: valueApi.html,
      theme,
      getJSON,
      getHTML,
      getValue,
      setValue,
      setJSON,
      setHTML,
    }),
    [
      editor,
      commands,
      valueApi.json,
      valueApi.html,
      theme,
      getJSON,
      getHTML,
      getValue,
      setValue,
      setJSON,
      setHTML,
    ],
  )
}
