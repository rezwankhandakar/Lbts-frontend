import { Printer, PrinterCheck, Repeat, Undo2 } from 'lucide-react'
import { BillingFlag } from '@/features/bill/components/bill-badges'
import { formatNumber } from '@/lib/format'
import { countOf, useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import {
  LOCATION_REVIEW_META,
  locationStatusMeta,
  locationSourceLabel,
} from '@/features/location/lib/location-meta'
import { isReviewableLocation } from '@/features/location/types'
import { atDepotQty, dispatchMetaFor } from '../lib/challan-meta'
import type { ChallanRecord } from '../types'

const FLAG = 'inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap'

/**
 * How much of a challan has left the gate, as a hairline and a count.
 *
 * `DispatchBadge` in the header says which state the record is in; this says
 * how much of it is left, which is a proportion rather than a word. Down a
 * page of cards a bar is read without being read — the difference between
 * scanning a list and reading one — and "3/4" is the figure somebody planning
 * the next lorry actually wants.
 *
 * Every number here is derived by the Delivery module from the trips. Nothing
 * on it is typed by anybody, which is why it is drawn in every state: an empty
 * bar is "nothing has gone", and that is information.
 */
export function DeliveryProgressBar({
  record,
  className,
}: {
  record: Pick<
    ChallanRecord,
    'dispatchStatus' | 'dispatchedQty' | 'totalQty' | 'returnedQty' | 'resentQty'
  >
  className?: string
}) {
  const t = useT()
  const meta = dispatchMetaFor(record, t)
  const total = record.totalQty
  const sent = Math.min(record.dispatchedQty, total)
  const percent = total > 0 ? Math.round((sent / total) * 100) : 0

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      title={t('challan.dispatch.progressTitle', {
        sent: formatNumber(sent),
        total: formatNumber(total),
        description: meta.description,
      })}
    >
      <div className="h-1 w-14 overflow-hidden rounded-full bg-muted sm:w-20">
        <div
          className={cn('h-full rounded-full transition-[width] duration-300', meta.dot)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground tabular-nums">
        {t('challan.dispatch.sentSlash', {
          sent: formatNumber(sent),
          total: formatNumber(total),
        })}
      </span>
    </div>
  )
}

/**
 * What the trips say came back, in two quiet flags: what is still on the
 * shelf, and what has gone out again. Nothing is drawn for a challan nothing
 * came back off — unlike the dispatch badge, this is detail rather than a
 * status, and an absent flag means there is nothing to say.
 */
export function ReturnFlags({
  record,
  className,
}: {
  record: Pick<ChallanRecord, 'returnedQty' | 'resentQty'>
  className?: string
}) {
  const t = useT()
  const atDepot = atDepotQty(record)
  const resent = record.resentQty ?? 0

  if (atDepot === 0 && resent === 0) {
    return null
  }

  return (
    <div
      className={cn('flex flex-wrap items-center gap-x-3 gap-y-0.5', className)}
      title={t('challan.dispatch.returnTitle', {
        returned: countOf(record.returnedQty ?? 0, 'nouns.piece', t),
        resent: countOf(resent, 'nouns.piece', t),
      })}
    >
      {atDepot > 0 && (
        <span className={cn(FLAG, 'text-tone-rose')}>
          <Undo2 className="size-3 shrink-0" aria-hidden />
          {t('challan.dispatch.backAtDepot', { n: formatNumber(atDepot) })}
        </span>
      )}
      {resent > 0 && (
        <span className={cn(FLAG, 'text-tone-cyan')}>
          <Repeat className="size-3 shrink-0" aria-hidden />
          {t('challan.dispatch.resent', { n: formatNumber(resent) })}
        </span>
      )}
    </div>
  )
}

/**
 * The three quiet things that are true of a record beside its status: whether
 * its paper has been printed, whether it is on a bill, and — only when it
 * wants attention — its location.
 *
 * Deliberately separated from `ChallanStatusBadge` and `DispatchBadge`, which
 * the card draws in its header: what the record *is* and where its goods are
 * read first, and these read as detail beneath them.
 */
export function ChallanRecordFlags({
  record,
  className,
}: {
  record: ChallanRecord
  className?: string
}) {
  const t = useT()

  const format = useFormatters()

  const when = record.printedAt ? format.dateTime(record.printedAt) : ''
  const printedTitle = record.printedBy
    ? t('challan.printMark.printedAtBy', { when, name: record.printedBy.name })
    : t('challan.printMark.printedAt', { when })
  const location = record.resolvedLocation
  const pending = locationStatusMeta('Pending', t)
  const review = LOCATION_REVIEW_META

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1', className)}>
      {record.printedAt ? (
        <span
          className={cn(FLAG, 'text-tone-violet')}
          title={printedTitle}
        >
          <PrinterCheck className="size-3 shrink-0" aria-hidden />
          {t('challan.printMark.printed')}
        </span>
      ) : (
        <span className={cn(FLAG, 'text-muted-foreground')}>
          <Printer className="size-3 shrink-0" aria-hidden />
          {t('challan.printMark.notPrinted')}
        </span>
      )}

      <BillingFlag status={record.billStatus} billNumbers={record.billNumbers} />

      {/* Never "Location set": the thana and district above already say so. */}
      {record.locationStatus === 'Pending' ? (
        <span className={cn(FLAG, 'text-tone-amber')} title={pending.description}>
          <pending.icon className="size-3 shrink-0" aria-hidden />
          {pending.label}
        </span>
      ) : (
        isReviewableLocation(location) &&
        location && (
          <span
            className={cn(FLAG, 'text-tone-orange')}
            title={t('location.reviewTitle', { source: locationSourceLabel(location.source, t) })}
          >
            <review.icon className="size-3 shrink-0" aria-hidden />
            {t('location.unconfirmedLocation')}
          </span>
        )
      )}
    </div>
  )
}
