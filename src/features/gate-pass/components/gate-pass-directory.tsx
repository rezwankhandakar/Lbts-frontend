import { cn } from '@/lib/utils'
import type { FilterPatch, GatePassListParams, GatePassListRecord, GatePassRecord } from '../types'
import type { GatePassActions } from './gate-pass-action-menu'
import { GatePassCards } from './gate-pass-cards'
import {
  GatePassDirectoryEmpty,
  GatePassDirectoryError,
  GatePassDirectorySkeleton,
} from './gate-pass-directory-states'
import { GatePassSheet } from './gate-pass-sheet'

interface GatePassDirectoryProps {
  records: GatePassListRecord[]
  actions: GatePassActions
  isLoading: boolean
  /** A background refetch — the previous page stays on screen, dimmed. */
  isFetching: boolean
  isError: boolean
  errorMessage: string
  isFiltered: boolean
  filters: GatePassListParams
  onFilterChange: (patch: FilterPatch) => void
  onRetry: () => void
  onReset: () => void
  onOpen: (record: GatePassRecord) => void
}

/**
 * Picks the presentation for the current state, and the layout for the current
 * viewport: a sheet with one row per product line from md up, cards below it. Nothing here invents data — an
 * empty result renders as an empty state, never as placeholder rows.
 *
 * A filtered sheet that matches nothing keeps its header: the column filter
 * that emptied it is in that header, and removing it would take it out of
 * reach.
 */
export function GatePassDirectory({
  records,
  actions,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  isFiltered,
  filters,
  onFilterChange,
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

  if (records.length === 0 && !isFiltered) {
    return <GatePassDirectoryEmpty isFiltered={false} canCreate={actions.canWrite} onReset={onReset} />
  }

  const empty =
    records.length === 0 ? (
      <GatePassDirectoryEmpty isFiltered canCreate={actions.canWrite} onReset={onReset} />
    ) : undefined

  return (
    <div
      className={cn(
        'transition-opacity duration-200',
        isFetching && 'pointer-events-none opacity-60',
      )}
      aria-busy={isFetching}
    >
      <div className="hidden md:block">
        <GatePassSheet
          records={records}
          actions={actions}
          onOpen={onOpen}
          filters={filters}
          onFilterChange={onFilterChange}
          empty={empty}
        />
      </div>
      <div className="md:hidden">
        {empty ?? <GatePassCards records={records} actions={actions} onOpen={onOpen} />}
      </div>
    </div>
  )
}
