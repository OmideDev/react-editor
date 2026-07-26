import { useEditorValue } from '../hooks/useEditorValue'

/**
 * Internal bridge that wires value / onChange into the Lexical composer.
 */
export function EditorValuePlugin({
  value,
  onChange,
  onJSONChange,
  onHTMLChange,
}) {
  useEditorValue({
    value,
    onChange,
    onJSONChange,
    onHTMLChange,
  })

  return null
}
