import { useCallback, useEffect, useRef, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { exportEditorValue, exportHTML, exportJSON } from '../utils/export'
import {
  getInitialEditorState,
  importEditorValue,
  resolveEditorValue,
} from '../utils/import'

/**
 * Listen to editor updates and expose JSON + HTML values.
 *
 * @param {object} [options]
 * @param {(data: { json: object, html: string }) => void} [options.onChange]
 * @param {(json: object) => void} [options.onJSONChange]
 * @param {(html: string) => void} [options.onHTMLChange]
 * @param {object|string|null} [options.value] Controlled/synced value
 */
export function useEditorValue({
  value,
  onChange,
  onJSONChange,
  onHTMLChange,
} = {}) {
  const [editor] = useLexicalComposerContext()
  const [current, setCurrent] = useState(() => ({
    json: null,
    html: '',
  }))
  const skipEmitRef = useRef(false)
  const lastAppliedRef = useRef(null)
  const isFirstValueSync = useRef(true)

  const readValue = useCallback(() => exportEditorValue(editor), [editor])

  useEffect(() => {
    // Seed local state from the current editor snapshot.
    setCurrent(readValue())

    return editor.registerUpdateListener(() => {
      if (skipEmitRef.current) {
        skipEmitRef.current = false
        const snapshot = readValue()
        setCurrent(snapshot)
        lastAppliedRef.current = JSON.stringify(snapshot.json)
        return
      }

      const snapshot = readValue()
      setCurrent(snapshot)
      lastAppliedRef.current = JSON.stringify(snapshot.json)

      onChange?.(snapshot)
      onJSONChange?.(snapshot.json)
      onHTMLChange?.(snapshot.html)
    })
  }, [editor, onChange, onHTMLChange, onJSONChange, readValue])

  useEffect(() => {
    if (value == null) {
      return
    }

    const resolved = resolveEditorValue(value)
    if (resolved.type === 'empty') {
      return
    }

    // Initial JSON was already applied via LexicalComposer initialConfig.
    if (isFirstValueSync.current) {
      isFirstValueSync.current = false
      if (resolved.type === 'json' && getInitialEditorState(value)) {
        lastAppliedRef.current = JSON.stringify(resolved.data)
        return
      }
    }

    const fingerprint =
      resolved.type === 'json'
        ? JSON.stringify(resolved.data)
        : `html:${resolved.data}`

    if (fingerprint === lastAppliedRef.current) {
      return
    }

    skipEmitRef.current = true
    importEditorValue(editor, value)
    lastAppliedRef.current = fingerprint
  }, [editor, value])

  return {
    json: current.json,
    html: current.html,
    exportJSON: () => exportJSON(editor),
    exportHTML: () => exportHTML(editor),
    importJSON: (json) => {
      skipEmitRef.current = true
      importEditorValue(editor, { json })
    },
    importHTML: (html) => {
      skipEmitRef.current = true
      importEditorValue(editor, { html })
    },
  }
}
