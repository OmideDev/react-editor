import { useEffect, useMemo, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $getSelection, $isRangeSelection } from 'lexical'

const RTL_CHAR_REGEX =
  /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/

/**
 * Detect whether text should use RTL based on first strong character.
 */
export function detectDirectionFromText(text = '') {
  for (const char of text) {
    if (RTL_CHAR_REGEX.test(char)) return 'rtl'
    if (/[A-Za-z0-9]/.test(char)) return 'ltr'
  }
  return 'ltr'
}

/**
 * Direction system for LTR / RTL / auto.
 * @param {'ltr'|'rtl'|'auto'} direction
 */
export function useDirection(direction = 'auto') {
  const [editor] = useLexicalComposerContext()
  const [autoDirection, setAutoDirection] = useState('ltr')

  useEffect(() => {
    if (direction !== 'auto') return undefined

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        let sample = ''

        if ($isRangeSelection(selection)) {
          sample = selection.getTextContent()
        }

        if (!sample.trim()) {
          sample = $getRoot().getTextContent().slice(0, 64)
        }

        setAutoDirection(detectDirectionFromText(sample))
      })
    })
  }, [direction, editor])

  const resolved = useMemo(() => {
    if (direction === 'rtl' || direction === 'ltr') return direction
    return autoDirection
  }, [autoDirection, direction])

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot()
      if (root.getDirection() !== resolved) {
        root.setDirection(resolved)
      }
    })
  }, [editor, resolved])

  return {
    direction: resolved,
    isRTL: resolved === 'rtl',
    isLTR: resolved === 'ltr',
    mode: direction,
  }
}
