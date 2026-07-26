import { Table2, Rows3, Columns3, Trash2 } from 'lucide-react'
import { ToolbarButton } from './ToolbarButton'
import { useIsInTable, useTableActions } from '../../plugins/TablePlugin'

/**
 * Insert table + row/column controls when selection is inside a table.
 */
export function TableButtons() {
  const inTable = useIsInTable()
  const { insertTable, addRow, addColumn, deleteRow, deleteColumn } =
    useTableActions()

  return (
    <>
      <ToolbarButton
        icon={Table2}
        label="Insert table"
        onClick={() => insertTable(3, 3)}
      />
      {inTable ? (
        <>
          <ToolbarButton icon={Rows3} label="Add row" onClick={addRow} />
          <ToolbarButton
            icon={Columns3}
            label="Add column"
            onClick={addColumn}
          />
          <ToolbarButton
            icon={Trash2}
            label="Delete row"
            onClick={deleteRow}
            className="hidden xl:inline-flex"
          />
          <ToolbarButton
            icon={Trash2}
            label="Delete column"
            onClick={deleteColumn}
            className="hidden xl:inline-flex"
          />
        </>
      ) : null}
    </>
  )
}
