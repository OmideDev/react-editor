import { useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ImageUploader } from '../ImageUploader'
import { INSERT_IMAGE_COMMAND } from '../../nodes/ImageNode'
import { useEditorFeatures } from '../../context/EditorFeaturesContext'
import { ToolbarButton } from './ToolbarButton'

/**
 * Direct image upload from the toolbar (file picker → onImageUpload → insert).
 * Separate from MediaLibraryButton / onOpenMediaLibrary.
 */
export function ImageButton({ className }) {
  const [editor] = useLexicalComposerContext()
  const { imageUpload } = useEditorFeatures()
  const [open, setOpen] = useState(false)

  if (!imageUpload) return null

  return (
    <>
      <ToolbarButton
        icon={ImagePlus}
        label="Upload image"
        active={open}
        onClick={() => setOpen(true)}
        className={className}
      />
      <ImageUploader
        open={open}
        onOpenChange={setOpen}
        onInsert={(payload) => {
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload)
          setOpen(false)
        }}
      />
    </>
  )
}
