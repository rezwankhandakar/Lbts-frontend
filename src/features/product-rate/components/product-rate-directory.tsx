import type { ProductRateRecord } from '../types'
import {
  ProductRateDirectoryEmpty,
  ProductRateDirectoryError,
  ProductRateDirectorySkeleton,
} from './product-rate-directory-states'
import { ProductRateTable } from './product-rate-table'

interface ProductRateDirectoryProps {
  records: ProductRateRecord[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  errorMessage: string
  isFiltered: boolean
  canManage: boolean
  onRetry: () => void
  onReset: () => void
  onAdd: () => void
  onEdit: (record: ProductRateRecord) => void
  onToggleActive: (record: ProductRateRecord) => void
  onDelete: (record: ProductRateRecord) => void
}

/**
 * Which of the four states the list is in: loading, failed, empty, or rows.
 *
 * Kept apart from the page so the page reads as composition and each state can
 * be given the wording it deserves — "nothing matched your filters" and "the
 * rate card is empty" have different fixes, and an empty rate card is usually
 * a database that has not connected rather than a genuine blank.
 */
export function ProductRateDirectory({
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
}: ProductRateDirectoryProps) {
  if (isLoading) {
    return <ProductRateDirectorySkeleton />
  }

  if (isError) {
    return (
      <ProductRateDirectoryError
        message={errorMessage}
        onRetry={onRetry}
        isRetrying={isFetching}
      />
    )
  }

  if (records.length === 0) {
    return (
      <ProductRateDirectoryEmpty
        isFiltered={isFiltered}
        canManage={canManage}
        onReset={onReset}
        onAdd={onAdd}
      />
    )
  }

  return (
    <ProductRateTable
      records={records}
      canManage={canManage}
      onEdit={onEdit}
      onToggleActive={onToggleActive}
      onDelete={onDelete}
    />
  )
}
