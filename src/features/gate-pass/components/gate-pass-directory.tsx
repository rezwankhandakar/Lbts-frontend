import { cn } from '@/lib/utils'
import type { GatePassRecord } from '../types'
import type { GatePassActions } from './gate-pass-action-menu'
import { GatePassCards } from './gate-pass-cards'
import {
  GatePassDirectoryEmpty,
  GatePassDirectoryError,
  GatePassDirectorySkeleton,
} from './gate-pass-directory-states'
import { GatePassTable } from './gate-pass-table'

interface GatePassDirectoryProps {
  records: GatePassRecord[]
  actions: GatePassActions
  isLoading: boolean
  /** A background refetch — the previous page stays on screen, dimmed. */
  isFetching: boolean
  isError: boolean
  errorMessage: string
  isFiltered: boolean
  onRetry: () => void
  onReset: () => void
  onOpen: (record: GatePassRecord) => void
}

/**
 * Picks the presentation for the current state, and the layout for the current
 * viewport: a table from md up, cards below it. Nothing here invents data — an
 * empty result renders as an empty state, never as placeholder rows.
 */
export function GatePassDirectory({
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
}: GatePassDirectoryProps) {
  if (isLoading) {
    return <GatePassDirectorySkeleton />
  }

  if (isError) {
    return <GatePassDirectoryError message={errorMessage} onRetry={onRetry} isRetrying={isFetching} />
  }

  if (records.length === 0) {
    return (
      <GatePassDirectoryEmpty
        isFiltered={isFiltered}
        canCreate={actions.canWrite}
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
        <GatePassTable records={records} actions={actions} onOpen={onOpen} />
      </div>
      <div className="md:hidden">
        <GatePassCards records={records} actions={actions} onOpen={onOpen} />
      </div>
    </div>
  )
}
