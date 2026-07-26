import { useEffect, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot } from 'lexical'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../lib/utils'
import {
  countCharacters,
  countWords,
  estimateReadingTimeMinutes,
} from '../utils/stats'

/**
 * Live word / character / reading-time stats.
 * Desktop: bottom-right. Mobile: collapsible.
 */
export function EditorStats({
  className,
  maxCharacters,
  showCharacterLimit = true,
}) {
  const [editor] = useLexicalComposerContext()
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    readingMinutes: 0,
  })
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const update = () => {
      editor.getEditorState().read(() => {
        const text = $getRoot().getTextContent()
        setStats({
          words: countWords(text),
          characters: countCharacters(text),
          charactersNoSpaces: countCharacters(text, { excludeSpaces: true }),
          readingMinutes: estimateReadingTimeMinutes(text),
        })
      })
    }

    update()
    return editor.registerUpdateListener(update)
  }, [editor])

  const overLimit =
    typeof maxCharacters === 'number' &&
    maxCharacters > 0 &&
    stats.characters > maxCharacters

  return (
    <div
      className={cn(
        'omid-editor-stats',
        'border-t border-[color:var(--editor-border)] bg-[color:var(--editor-toolbar)]',
        'px-3 py-1.5 text-[11px] text-[color:var(--editor-muted)]',
        className,
      )}
    >
      {/* Mobile collapsible */}
      <button
        type="button"
        className="flex w-full items-center justify-between sm:hidden"
        onClick={() => setExpanded((v) => !v)}
      >
        <span>
          {stats.words} words
          {typeof maxCharacters === 'number' ? (
            <>
              {' · '}
              <span className={overLimit ? 'text-[color:var(--editor-danger)]' : ''}>
                {stats.characters} / {maxCharacters}
              </span>
            </>
          ) : null}
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      <div
        className={cn(
          'flex flex-wrap items-center justify-end gap-x-4 gap-y-1',
          'max-sm:mt-2 max-sm:justify-start',
          !expanded && 'max-sm:hidden',
        )}
      >
        <span>
          Words: <strong className="font-semibold text-[color:var(--editor-text)]">{stats.words}</strong>
        </span>
        <span>
          Characters:{' '}
          <strong className="font-semibold text-[color:var(--editor-text)]">
            {stats.characters}
          </strong>
          <span className="opacity-70"> ({stats.charactersNoSpaces} no spaces)</span>
        </span>
        <span>
          Reading time:{' '}
          <strong className="font-semibold text-[color:var(--editor-text)]">
            {stats.readingMinutes} min
          </strong>
        </span>
        {showCharacterLimit && typeof maxCharacters === 'number' ? (
          <span
            className={cn(
              overLimit && 'text-[color:var(--editor-danger)]',
            )}
          >
            {stats.characters} / {maxCharacters}
          </span>
        ) : null}
      </div>
    </div>
  )
}
