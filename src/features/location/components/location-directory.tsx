import type { LocationRecord } from '../types'
import {
  LocationDirectoryEmpty,
  LocationDirectoryError,
  LocationDirectorySkeleton,
} from './location-directory-states'
import { LocationTable } from './location-table'

interface LocationDirectoryProps {
  records: LocationRecord[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  errorMessage: string
  isFiltered: boolean
  canManage: boolean
  onRetry: () => void
  onReset: () => void
  onAdd: () => void
  onEdit: (location: LocationRecord) => void
  onToggleActive: (location: LocationRecord) => void
  onDelete: (location: LocationRecord) => void
}

/**
 * Which of the four states the list is in: loading, failed, empty, or rows.
 *
 * Kept apart from the page so the page reads as composition and each state can
 * be given the wording it deserves — "nothing matched your filters" and "the
 * master list is empty" have different fixes, and an empty master list is
 * usually a database that has not connected rather than a genuine blank.
 */
export function LocationDirectory({
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
  onToggleActive,
  onDelete,
}: LocationDirectoryProps) {
  if (isLoading) {
    return <LocationDirectorySkeleton />
  }

  if (isError) {
    return (
      <LocationDirectoryError
        message={errorMessage}
        onRetry={onRetry}
        isRetrying={isFetching}
      />
    )
  }

  if (records.length === 0) {
    return (
      <LocationDirectoryEmpty
        isFiltered={isFiltered}
        canManage={canManage}
        onReset={onReset}
        onAdd={onAdd}
      />
    )
  }

  return (
    <LocationTable
      records={records}
      canManage={canManage}
      onEdit={onEdit}
      onToggleActive={onToggleActive}
      onDelete={onDelete}
    />
  )
}
