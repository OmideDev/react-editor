import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { MediaLibrary } from '../MediaLibrary'
import { INSERT_IMAGE_COMMAND } from '../../nodes/ImageNode'
import { ToolbarButton } from './ToolbarButton'

/**
 * Opens the media library to pick / upload an image.
 */
export function ImageButton({ className }) {
  const [editor] = useLexicalComposerContext()
  const [open, setOpen] = useState(false)

  return (
    <>
      <ToolbarButton
        icon={ImageIcon}
        label="Image"
        active={open}
        onClick={() => setOpen(true)}
        className={className}
      />
      <MediaLibrary
        open={open}
        onOpenChange={setOpen}
        onInsert={(payload) => {
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload)
        }}
      />
    </>
  )
}
