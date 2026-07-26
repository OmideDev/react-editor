import { useCallback } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { FileText, Trash2, Download } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatFileSize } from '../utils/file'
import { $isFileNode } from './FileNode'

export function FileComponent({
  nodeKey,
  name,
  size,
  mimeType,
  src,
}) {
  const [editor] = useLexicalComposerContext()

  const remove = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isFileNode(node)) node.remove()
    })
  }, [editor, nodeKey])

  return (
    <div
      className={cn(
        'omid-editor-file-block my-2 flex items-center gap-3 rounded-xl border px-3 py-2.5',
        'border-[color:var(--editor-border)] bg-[color:var(--editor-surface)]',
      )}
      contentEditable={false}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--editor-hover)] text-[color:var(--editor-text)]">
        <FileText className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[color:var(--editor-text)]">
          {name}
        </p>
        <p className="text-xs text-[color:var(--editor-muted)]">
          {formatFileSize(size)}
          {mimeType ? ` · ${mimeType}` : ''}
        </p>
      </div>
      <a
        href={src}
        download={name}
        className="omid-editor-video-btn"
        aria-label="Download file"
        onClick={(e) => e.stopPropagation()}
      >
        <Download className="h-3.5 w-3.5" />
      </a>
      <button
        type="button"
        className="omid-editor-video-btn"
        aria-label="Delete file"
        onClick={(e) => {
          e.stopPropagation()
          remove()
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
