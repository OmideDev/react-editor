import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
} from 'lexical'
import {
  $createVideoNode,
  INSERT_VIDEO_COMMAND,
  VideoNode,
} from '../nodes/VideoNode'
import { isVideoUrl, parseVideoUrl } from '../utils/video'

/**
 * Auto-embeds YouTube / Vimeo URLs on paste and INSERT_VIDEO_COMMAND.
 */
export function VideoPlugin({ enabled = true }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!enabled) return undefined

    if (!editor.hasNodes([VideoNode])) {
      console.error('VideoPlugin: VideoNode is not registered.')
      return undefined
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_VIDEO_COMMAND,
        (payload) => {
          const parsed =
            typeof payload === 'string' ? parseVideoUrl(payload) : payload
          if (!parsed?.src) return false

          const video = $createVideoNode({
            src: parsed.src,
            url: parsed.url || payload?.url || '',
            provider: parsed.provider || 'youtube',
          })
          $insertNodeToNearestRoot(video)
          $insertNodeToNearestRoot($createParagraphNode())
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
          const clipboard = event?.clipboardData
          if (!clipboard) return false

          const text = clipboard.getData('text/plain')?.trim()
          if (!text || !isVideoUrl(text)) return false

          const parsed = parseVideoUrl(text)
          if (!parsed) return false

          event.preventDefault()
          editor.dispatchCommand(INSERT_VIDEO_COMMAND, parsed)
          return true
        },
        COMMAND_PRIORITY_HIGH,
      ),
    )
  }, [editor, enabled])

  return null
}
