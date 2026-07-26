import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { canUseDOM } from '../utils/dom'
import {
  createOmidPrismTokenizer,
  loadPrism,
  registerOmidCodeHighlighting,
} from '../code/prismProvider'

/**
 * Code highlighting — Prism via ES module, no global Prism, no component scripts.
 */
export function CodePlugin({ enabled = true }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!enabled || !canUseDOM) return undefined

    let cancelled = false
    let unregister = null

    ;(async () => {
      try {
        const Prism = await loadPrism()
        if (cancelled) return
        const tokenizer = createOmidPrismTokenizer(Prism)
        unregister = registerOmidCodeHighlighting(editor, tokenizer)
      } catch (error) {
        console.error('CodePlugin: failed to initialize highlighter', error)
      }
    })()

    return () => {
      cancelled = true
      unregister?.()
    }
  }, [editor, enabled])

  return null
}
