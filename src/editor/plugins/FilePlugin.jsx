import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical'
import {
  $createFileNode,
  INSERT_FILE_COMMAND,
  FileNode,
} from '../nodes/FileNode'

/**
 * Registers file attachment insert command.
 */
export function FilePlugin({ enabled = true }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!enabled) return undefined

    if (!editor.hasNodes([FileNode])) {
      console.error('FilePlugin: FileNode is not registered.')
      return undefined
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_FILE_COMMAND,
        (payload) => {
          if (!payload?.src || !payload?.name) return false
          const fileNode = $createFileNode(payload)
          $insertNodeToNearestRoot(fileNode)
          $insertNodeToNearestRoot($createParagraphNode())
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  }, [editor, enabled])

  return null
}
