import { useState } from 'react'
import { ColumnFilterDropdown } from '@/components/shared/column-filter-dropdown'
import { setColumnFilter } from '@/lib/column-filters'
import { useColumnValues } from '../hooks/use-trip-do'
import { columnValueLabel } from '../lib/trip-do-columns'
import type { TripDoColumnId, TripDoFilterPatch, TripDoListParams } from '../types'
import { useT } from '@/lib/i18n'

interface ColumnFilterMenuProps {
  column: TripDoColumnId
  label: string
  params: TripDoListParams
  onChange: (patch: TripDoFilterPatch) => void
}

/** One Trip DO sheet column's filter dropdown, its values fetched only while open. */
export function ColumnFilterMenu({ column, label, params, onChange }: ColumnFilterMenuProps) {
  const t = useT()

  const [open, setOpen] = useState(false)
  const query = useColumnValues(column, params, open)

  return (
    <ColumnFilterDropdown
      label={label}
      applied={params.columns[column]}
      open={open}
      onOpenChange={setOpen}
      data={query.data}
      isLoading={query.isPending}
      errorMessage={query.isError ? query.error.message : null}
      labelOf={(value) => columnValueLabel(column, value, t)}
      onApply={(values) => onChange({ columns: setColumnFilter(params.columns, column, values) })}
    />
  )
}
