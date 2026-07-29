import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
} from 'lexical'
import {
  $createImageNode,
  $isImageNode,
  DELETE_IMAGE_COMMAND,
  ImageNode,
  INSERT_IMAGE_COMMAND,
} from '../nodes/ImageNode'
import {
  DEFAULT_IMAGE_WIDTH,
  isAcceptedImageFile,
  loadImageDimensions,
  readImageAsDataURL,
  clampImageWidth,
  MAX_IMAGE_WIDTH,
} from '../utils/image'

/**
 * Registers image insert/delete commands and clipboard image paste.
 */
export function ImagePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      console.error(
        'ImagePlugin: ImageNode is not registered in the editor config.',
      )
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          if (!payload?.src) return false

          const imageNode = $createImageNode({
            src: payload.src,
            altText: payload.altText || '',
            width: payload.width ?? 'inherit',
            height: payload.height ?? 'inherit',
            caption: payload.caption || '',
            align: payload.align || 'left',
          })

          $insertNodeToNearestRoot(imageNode)

          const paragraph = $createParagraphNode()
          imageNode.insertAfter(paragraph)
          paragraph.select()

          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        DELETE_IMAGE_COMMAND,
        (nodeKey) => {
          if (nodeKey) {
            const node = $getNodeByKey(nodeKey)
            if ($isImageNode(node)) {
              node.remove()
              return true
            }
          }

          const selection = $getSelection()
          if ($isNodeSelection(selection)) {
            const nodes = selection.getNodes()
            for (const node of nodes) {
              if ($isImageNode(node)) {
                node.remove()
              }
            }
            return true
          }

          return false
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
          const clipboardData = event?.clipboardData
          if (!clipboardData) return false

          const items = Array.from(clipboardData.items || [])
          const imageItem = items.find((item) => item.type.startsWith('image/'))
          if (!imageItem) return false

          const file = imageItem.getAsFile()
          if (!file || !isAcceptedImageFile(file)) return false

          event.preventDefault()

          void (async () => {
            try {
              const src = await readImageAsDataURL(file)
              const dims = await loadImageDimensions(src)
              const width = clampImageWidth(
                Math.min(dims.width, DEFAULT_IMAGE_WIDTH),
                MAX_IMAGE_WIDTH,
              )
              const height = Math.round((width / dims.width) * dims.height)

              editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                src,
                altText: file.name || 'Pasted image',
                width,
                height,
                caption: '',
              })
            } catch (error) {
              console.error('[OmidEditor] Failed to paste image:', error)
            }
          })()

          return true
        },
        COMMAND_PRIORITY_HIGH,
      ),
    )
  }, [editor])

  return null
}

export { INSERT_IMAGE_COMMAND, DELETE_IMAGE_COMMAND }
