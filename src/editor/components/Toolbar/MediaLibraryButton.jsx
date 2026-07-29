import { useState } from 'react'
import { Images } from 'lucide-react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { MediaLibrary } from '../MediaLibrary'
import { INSERT_IMAGE_COMMAND } from '../../nodes/ImageNode'
import { useEditorFeatures } from '../../context/EditorFeaturesContext'
import { useEditorUpload } from '../../context/EditorUploadContext'
import { ToolbarButton } from './ToolbarButton'

/**
 * Media library toolbar icon.
 *
 * - If `onOpenMediaLibrary` is set → only calls that (host owns the picker).
 * - Else if `features.mediaLibrary` → opens the built-in localStorage library.
 * - Else → hidden.
 */
export function MediaLibraryButton({ className }) {
  const [editor] = useLexicalComposerContext()
  const { mediaLibrary } = useEditorFeatures()
  const { onOpenMediaLibrary } = useEditorUpload()
  const [open, setOpen] = useState(false)

  const hasExternal = typeof onOpenMediaLibrary === 'function'
  const showInternal = mediaLibrary && !hasExternal

  if (!hasExternal && !showInternal) return null

  return (
    <>
      <ToolbarButton
        icon={Images}
        label="Media library"
        active={!hasExternal && open}
        onClick={() => {
          if (hasExternal) {
            onOpenMediaLibrary()
            return
          }
          setOpen(true)
        }}
        className={className}
      />
      {showInternal ? (
        <MediaLibrary
          open={open}
          onOpenChange={setOpen}
          onInsert={(payload) => {
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload)
          }}
        />
      ) : null}
    </>
  )
}
