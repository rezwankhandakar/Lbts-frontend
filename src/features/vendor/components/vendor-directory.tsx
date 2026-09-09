import { Building2 } from 'lucide-react'
import type { VendorRecord } from '../types'
import { PanelEmpty, PanelError, PanelSkeleton } from './panel-states'
import { VendorCards } from './vendor-cards'
import { VendorTable } from './vendor-table'

interface VendorDirectoryProps {
  records: VendorRecord[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  errorMessage: string
  isFiltered: boolean
  canManage: boolean
  onRetry: () => void
  onReset: () => void
  onAdd: () => void
  onEdit: (vendor: VendorRecord) => void
  onChangeStatus: (vendor: VendorRecord) => void
  onDelete: (vendor: VendorRecord) => void
}

/**
 * Which of the four states the directory is in: loading, failed, empty, or rows.
 *
 * Kept apart from the page so the page reads as composition, and so each state
 * can be given the wording it deserves — "nothing matched your filters" and "no
 * vendors have been added" have different fixes. The same arrangement the
 * Location module uses.
 */
export function VendorDirectory({
  records,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  isFiltered,
  canManage,
  onRetry,
  onReset,
  onAdd,
  onEdit,
  onChangeStatus,
  onDelete,
}: VendorDirectoryProps) {
  if (isLoading) {
    return <PanelSkeleton rows={6} />
  }

  if (isError) {
    return (
      <PanelError
        title="Could not load vendors"
        message={errorMessage}
        onRetry={onRetry}
        isRetrying={isFetching}
      />
    )
  }

  if (records.length === 0) {
    return (
      <PanelEmpty
        icon={Building2}
        title="No vendors yet"
        description="A vendor is the company that supplies the vehicles and the drivers. Add the first one, then record its fleet underneath it."
        isFiltered={isFiltered}
        onReset={onReset}
        action={canManage ? { label: 'Add vendor', onClick: onAdd } : undefined}
      />
    )
  }

  return (
    <>
      <VendorTable
        records={records}
        canManage={canManage}
        onEdit={onEdit}
        onChangeStatus={onChangeStatus}
        onDelete={onDelete}
      />
      <VendorCards
        records={records}
        canManage={canManage}
        onEdit={onEdit}
        onChangeStatus={onChangeStatus}
        onDelete={onDelete}
      />
    </>
  )
}
