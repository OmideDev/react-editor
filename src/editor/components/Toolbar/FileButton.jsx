import { useState } from 'react'
import { FileUp } from 'lucide-react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ToolbarButton } from './ToolbarButton'
import { FileUploader } from '../FileUploader'
import { INSERT_FILE_COMMAND } from '../../nodes/FileNode'

/**
 * Toolbar control that opens the file uploader.
 */
export function FileButton({ className }) {
  const [editor] = useLexicalComposerContext()
  const [open, setOpen] = useState(false)

  return (
    <>
      <ToolbarButton
        icon={FileUp}
        label="File"
        active={open}
        onClick={() => setOpen(true)}
        className={className}
      />
      <FileUploader
        open={open}
        onOpenChange={setOpen}
        onInsert={(payload) => {
          editor.dispatchCommand(INSERT_FILE_COMMAND, payload)
        }}
      />
    </>
  )
}
