import { ChevronDown, Phone, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useEntry } from '../hooks/use-accounts'
import { useEntryDialog } from '../hooks/use-entry-dialog'
import { formatDay, taka } from '../lib/accounts-meta'
import type { EntryRecord } from '../types'
import { ProgressBar, SettlementBadge } from './account-atoms'
import { EntryActionsMenu } from './entry-actions-menu'
import { EntryList } from './entry-list'

/**
 * One advance and how much of its cash has come back. An advance is settled by
 * returning cash and nothing else, so "Cash returned" is the one settling
 * action, and it opens the entry form with this advance already chosen; the
 * history is fetched only when somebody opens it.
 */
export function AdvanceCard({ advance, canWrite }: { advance: EntryRecord; canWrite: boolean }) {
  const dialog = useEntryDialog()
  const [expanded, setExpanded] = useState(false)
  const detail = useEntry(expanded ? advance.id : null)
  const open = advance.outstanding > 0

  const returnCash = () =>
    dialog.open({
      kind: 'AdvanceReturn',
      preset: { advanceId: advance.id, amount: advance.outstanding, walletId: advance.wallet?.id ?? '' },
      locked: ['advanceId'],
    })

  return (
    <article className="flex flex-col rounded-xl border bg-card shadow-xs">
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{advance.party}</h3>
            {advance.settlementStatus && <SettlementBadge status={advance.settlementStatus} />}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{advance.purpose || 'No purpose noted'}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 text-[11px] text-muted-foreground">
            <span>{formatDay(advance.date)}</span>
            <span className="font-mono">{advance.entryNumber}</span>
            {advance.partyPhone && (
              <a href={`tel:${advance.partyPhone}`} className="flex items-center gap-1 hover:text-primary">
                <Phone className="size-3" aria-hidden />
                {advance.partyPhone}
              </a>
            )}
          </p>
        </div>
        {canWrite && <EntryActionsMenu entry={advance} />}
      </div>

      <div className="grid gap-2 px-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {taka(advance.settledAmount)} settled of {taka(advance.amount)}
          </span>
          <span className={cn('text-lg font-semibold tabular-nums', open ? 'text-tone-amber' : 'text-tone-emerald')}>
            {open ? taka(advance.outstanding) : 'Settled'}
          </span>
        </div>
        <ProgressBar value={advance.settledAmount} max={advance.amount} tone={open ? 'amber' : 'emerald'} />
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 p-4 pt-3">
        {canWrite && open && (
          <Button size="sm" variant="outline" onClick={returnCash}>
            <RotateCcw data-icon="inline-start" aria-hidden />
            Cash returned
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto text-muted-foreground"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          History
          <ChevronDown data-icon="inline-end" className={cn('transition', expanded && 'rotate-180')} aria-hidden />
        </Button>
      </div>

      {expanded && (
        <div className="border-t">
          {detail.isPending ? (
            <Skeleton className="m-4 h-12" />
          ) : (
            <EntryList
              records={detail.data?.settlements ?? []}
              isLoading={false}
              errorMessage={detail.isError ? detail.error.message : null}
              onRetry={() => void detail.refetch()}
              canWrite={canWrite}
              compact
              emptyTitle="Nothing settled yet"
              emptyDescription="Cash returned against this advance appears here."
            />
          )}
        </div>
      )}
    </article>
  )
}
