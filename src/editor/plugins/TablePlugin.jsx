import { useCallback, useEffect, useState } from 'react'
import { TablePlugin as LexicalTablePlugin } from '@lexical/react/LexicalTablePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  INSERT_TABLE_COMMAND,
  $insertTableColumn__EXPERIMENTAL,
  $insertTableRow__EXPERIMENTAL,
  $deleteTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $isTableNode,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from 'lexical'
import { $findMatchingParent, mergeRegister } from '@lexical/utils'

export const INSERT_EDITOR_TABLE_COMMAND = createCommand(
  'INSERT_EDITOR_TABLE_COMMAND',
)
export const TABLE_ADD_ROW_COMMAND = createCommand('TABLE_ADD_ROW_COMMAND')
export const TABLE_ADD_COLUMN_COMMAND = createCommand('TABLE_ADD_COLUMN_COMMAND')
export const TABLE_DELETE_ROW_COMMAND = createCommand('TABLE_DELETE_ROW_COMMAND')
export const TABLE_DELETE_COLUMN_COMMAND = createCommand(
  'TABLE_DELETE_COLUMN_COMMAND',
)

/**
 * Table support: insert, add/delete rows & columns (Lexical table nodes).
 */
export function TablePlugin({ enabled = true }) {
  const [editor] = useLexicalComposerContext()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!enabled) return
    if (!editor.hasNodes([TableNode, TableRowNode, TableCellNode])) {
      console.error(
        'TablePlugin: TableNode, TableRowNode, and TableCellNode must be registered.',
      )
      return
    }
    setReady(true)
  }, [editor, enabled])

  useEffect(() => {
    if (!enabled || !ready) return undefined

    return mergeRegister(
      editor.registerCommand(
        INSERT_EDITOR_TABLE_COMMAND,
        ({ rows = 3, columns = 3, includeHeaders = true } = {}) => {
          editor.dispatchCommand(INSERT_TABLE_COMMAND, {
            rows: String(rows),
            columns: String(columns),
            includeHeaders,
          })
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        TABLE_ADD_ROW_COMMAND,
        () => {
          editor.update(() => {
            $insertTableRow__EXPERIMENTAL(true)
          })
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        TABLE_ADD_COLUMN_COMMAND,
        () => {
          editor.update(() => {
            $insertTableColumn__EXPERIMENTAL(true)
          })
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        TABLE_DELETE_ROW_COMMAND,
        () => {
          editor.update(() => {
            $deleteTableRow__EXPERIMENTAL()
          })
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        TABLE_DELETE_COLUMN_COMMAND,
        () => {
          editor.update(() => {
            $deleteTableColumn__EXPERIMENTAL()
          })
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  }, [editor, enabled, ready])

  if (!enabled || !ready) return null

  return (
    <LexicalTablePlugin
      hasCellMerge
      hasCellBackgroundColor={false}
      hasHorizontalScroll
    />
  )
}

export function useIsInTable() {
  const [editor] = useLexicalComposerContext()
  const [inTable, setInTable] = useState(false)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          setInTable(false)
          return
        }
        const table = $findMatchingParent(
          selection.anchor.getNode(),
          $isTableNode,
        )
        setInTable(Boolean(table))
      })
    })
  }, [editor])

  return inTable
}

export function useTableActions() {
  const [editor] = useLexicalComposerContext()

  return {
    insertTable: useCallback(
      (rows = 3, columns = 3) => {
        editor.dispatchCommand(INSERT_EDITOR_TABLE_COMMAND, { rows, columns })
      },
      [editor],
    ),
    addRow: useCallback(() => {
      editor.dispatchCommand(TABLE_ADD_ROW_COMMAND, undefined)
    }, [editor]),
    addColumn: useCallback(() => {
      editor.dispatchCommand(TABLE_ADD_COLUMN_COMMAND, undefined)
    }, [editor]),
    deleteRow: useCallback(() => {
      editor.dispatchCommand(TABLE_DELETE_ROW_COMMAND, undefined)
    }, [editor]),
    deleteColumn: useCallback(() => {
      editor.dispatchCommand(TABLE_DELETE_COLUMN_COMMAND, undefined)
    }, [editor]),
  }
}
