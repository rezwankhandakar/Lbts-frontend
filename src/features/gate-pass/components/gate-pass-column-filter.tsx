import { useState } from 'react'
import { ColumnFilterDropdown } from '@/components/shared/column-filter-dropdown'
import { setColumnFilter } from '@/lib/column-filters'
import { useGatePassColumnValues } from '../hooks/use-gate-passes'
import { gatePassColumnLabel } from '../lib/gate-pass-columns'
import type { FilterPatch, GatePassColumnId, GatePassListParams } from '../types'
import { useT } from '@/lib/i18n'

interface GatePassColumnFilterProps {
  column: GatePassColumnId
  label: string
  params: GatePassListParams
  onChange: (patch: FilterPatch) => void
}

/** One records sheet column's filter dropdown, its values fetched only while open. */
export function GatePassColumnFilter({ column, label, params, onChange }: GatePassColumnFilterProps) {
  const t = useT()

  const [open, setOpen] = useState(false)
  const query = useGatePassColumnValues(column, params, open)

  return (
    <ColumnFilterDropdown
      label={label}
      applied={params.columns[column]}
      open={open}
      onOpenChange={setOpen}
      data={query.data}
      isLoading={query.isPending}
      errorMessage={query.isError ? query.error.message : null}
      labelOf={(value) => gatePassColumnLabel(column, value, t)}
      onApply={(values) => onChange({ columns: setColumnFilter(params.columns, column, values) })}
    />
  )
}
