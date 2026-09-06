import { cn } from '@/lib/utils'
import { canWriteChallans } from '../types'
import type { ChallanRecord } from '../types'
import { ChallanCards } from './challan-cards'
import type { ChallanActions } from './challan-action-menu'
import {
  ChallanDirectoryEmpty,
  ChallanDirectoryError,
  ChallanDirectorySkeleton,
} from './challan-directory-states'
import { ChallanTable } from './challan-table'

interface ChallanDirectoryProps {
  records: ChallanRecord[]
  actions: ChallanActions
  isLoading: boolean
  /** A background refetch — the previous page stays on screen, dimmed. */
  isFetching: boolean
  isError: boolean
  errorMessage: string
  isFiltered: boolean
  onRetry: () => void
  onReset: () => void
  onOpen: (record: ChallanRecord) => void
}

/**
 * Picks the presentation for the current state, and the layout for the current
 * viewport: a table from md up, cards below it. Nothing here invents data — an
 * empty result renders as an empty state, never as placeholder rows.
 */
export function ChallanDirectory({
  records,
  actions,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  isFiltered,
  onRetry,
  onReset,
  onOpen,
}: ChallanDirectoryProps) {
  if (isLoading) {
    return <ChallanDirectorySkeleton />
  }

  if (isError) {
    return (
      <ChallanDirectoryError message={errorMessage} onRetry={onRetry} isRetrying={isFetching} />
    )
  }

  if (records.length === 0) {
    return (
      <ChallanDirectoryEmpty
        isFiltered={isFiltered}
        canCreate={canWriteChallans(actions.role)}
        onReset={onReset}
      />
    )
  }

  return (
    <div
      className={cn(
        'transition-opacity duration-200',
        isFetching && 'pointer-events-none opacity-60',
      )}
      aria-busy={isFetching}
    >
      <div className="hidden overflow-x-auto md:block">
        <ChallanTable records={records} actions={actions} onOpen={onOpen} />
      </div>
      <div className="md:hidden">
        <ChallanCards records={records} actions={actions} onOpen={onOpen} />
      </div>
    </div>
  )
}
