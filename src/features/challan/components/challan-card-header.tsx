import { useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { challanStatusMeta, dispatchMetaFor } from '../lib/challan-meta'
import type { ChallanRecord } from '../types'
import { ChallanActionMenu } from './challan-action-menu'
import type { ChallanActions } from './challan-action-menu'

interface ChallanCardHeaderProps {
  record: ChallanRecord
  actions: ChallanActions
  onOpen: (record: ChallanRecord) => void
}

/**
 * The band across the top of a record card, in the colour of where its goods
 * are: the identifiers and both statuses, then the customer, then the pieces.
 *
 * The same band the trip page's challan card opens with (`ChallanCardHeader`
 * in Delivery's `challan-card-parts.tsx`), so a challan reads as the same thing
 * on the records list and on a lorry. What colours it differs with the job:
 * there it is how the delivery finished, here it is how much has left the gate
 * — so the ones nobody has loaded yet are found down a page without reading a
 * word. The colour is a band token, because it carries white text in both
 * themes; the circle carries the dispatch icon rather than a number, because a
 * position on a page of search results is a number nobody needs.
 *
 * The challan number is the button that makes the card keyboard-reachable, and
 * the action menu stops its click from reaching the card underneath it.
 */
export function ChallanCardHeader({ record, actions, onOpen }: ChallanCardHeaderProps) {
  const t = useT()
  const format = useFormatters()

  const dispatch = dispatchMetaFor(record, t)
  const status = challanStatusMeta(record.status, t)
  const DispatchIcon = dispatch.icon
  const StatusIcon = status.icon

  return (
    <header className={cn('relative isolate overflow-hidden px-3.5 py-2.5 text-primary-foreground', dispatch.band)}>
      <div
        className="pointer-events-none absolute -top-14 -right-8 size-32 rounded-full bg-primary-foreground/10"
        aria-hidden
      />

      <div className="relative flex items-center gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground',
            dispatch.bandText,
          )}
          title={dispatch.description}
        >
          <DispatchIcon className="size-4" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onOpen(record)
              }}
              className="font-mono text-xs font-semibold break-all outline-none hover:underline focus-visible:underline"
            >
              {record.challanNumber}
            </button>
            <span className="rounded-full bg-primary-foreground/20 px-1.5 py-px text-[10px] font-semibold tabular-nums">
              {t('challan.pages.slWith', { sl: format.number(record.slNumber) })}
            </span>
            <span className="text-[11px] font-medium text-primary-foreground/85 tabular-nums">
              {format.date(record.submittedAt)}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full bg-primary-foreground px-2 py-px text-[11px] font-semibold',
                dispatch.bandText,
              )}
              title={dispatch.description}
            >
              <span className="size-1.5 rounded-full bg-current" aria-hidden />
              {dispatch.label}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/20 px-2 py-px text-[11px] font-semibold"
              title={status.description}
            >
              <StatusIcon className="size-3" aria-hidden />
              {status.label}
            </span>
          </div>
          <p className="mt-1 truncate text-[15px] leading-tight font-bold" title={record.customerName}>
            {record.customerName}
          </p>
        </div>

        <div className="shrink-0 border-l border-primary-foreground/25 ps-3 text-right">
          <p className="text-2xl leading-none font-bold tabular-nums">{format.number(record.totalQty)}</p>
          <p className="text-[11px] text-primary-foreground/85">{t('nouns.pc', { count: record.totalQty })}</p>
        </div>

        <div className="-me-1.5 self-start" onClick={(event) => event.stopPropagation()}>
          <ChallanActionMenu
            record={record}
            actions={actions}
            triggerClassName="text-primary-foreground/85 hover:bg-primary-foreground/15 hover:text-primary-foreground aria-expanded:bg-primary-foreground/15 aria-expanded:text-primary-foreground dark:hover:bg-primary-foreground/15"
          />
        </div>
      </div>
    </header>
  )
}
