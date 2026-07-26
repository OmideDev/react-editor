import { useCallback, useEffect, useRef, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { exportEditorValue } from '../utils/export'

/**
 * Debounced auto-save for editor JSON + HTML.
 *
 * @param {object} options
 * @param {boolean} [options.enabled=true]
 * @param {number} [options.delay=2000]
 * @param {(data: { json: object, html: string }) => void|Promise<void>} [options.onSave]
 */
export function useAutoSave({
  enabled = true,
  delay = 2000,
  onSave,
} = {}) {
  const [editor] = useLexicalComposerContext()
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [error, setError] = useState(null)
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const timerRef = useRef(null)
  const onSaveRef = useRef(onSave)
  const skipFirstRef = useRef(true)

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  const saveNow = useCallback(async () => {
    if (!onSaveRef.current) return

    setStatus('saving')
    setError(null)
    try {
      const data = exportEditorValue(editor)
      await onSaveRef.current(data)
      setStatus('saved')
      setLastSavedAt(Date.now())
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Save failed')
    }
  }, [editor])

  useEffect(() => {
    if (!enabled || typeof onSave !== 'function') return undefined

    return editor.registerUpdateListener(() => {
      if (skipFirstRef.current) {
        skipFirstRef.current = false
        return
      }

      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }

      timerRef.current = window.setTimeout(() => {
        saveNow()
      }, delay)
    })
  }, [delay, editor, enabled, onSave, saveNow])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  return {
    status,
    saving: status === 'saving',
    saved: status === 'saved',
    error,
    lastSavedAt,
    saveNow,
  }
}

/**
 * Bridge plugin that runs useAutoSave and reports status upward.
 */
export function AutoSavePlugin({ autoSave, onStatusChange }) {
  const enabled =
    Boolean(autoSave) &&
    autoSave.enabled !== false &&
    typeof autoSave.onSave === 'function'

  const result = useAutoSave({
    enabled,
    delay: autoSave?.delay ?? 2000,
    onSave: autoSave?.onSave,
  })

  useEffect(() => {
    if (!enabled) return
    onStatusChange?.(result)
  }, [
    enabled,
    onStatusChange,
    result.status,
    result.saving,
    result.saved,
    result.error,
    result.lastSavedAt,
  ])

  return null
}
