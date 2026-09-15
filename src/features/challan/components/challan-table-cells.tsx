import { Printer, PrinterCheck, Repeat, Undo2 } from 'lucide-react'
import { BillingFlag } from '@/features/bill/components/bill-badges'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  LOCATION_REVIEW_META,
  LOCATION_STATUS_META,
  locationSourceLabel,
} from '@/features/location/lib/location-meta'
import { isReviewableLocation } from '@/features/location/types'
import { atDepotQty, dispatchMetaFor } from '../lib/challan-meta'
import type { ChallanRecord } from '../types'
import { ChallanStatusBadge, DispatchBadge } from './challan-status-badge'

const FLAG = 'inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap'

/**
 * What the trips say came back, in two quiet lines: what is still on the
 * shelf, and what has gone out again. Nothing is drawn for a challan nothing
 * came back off — unlike the badge, this is detail rather than a status.
 */
export function ReturnFlags({
  record,
  className,
}: {
  record: Pick<ChallanRecord, 'returnedQty' | 'resentQty'>
  className?: string
}) {
  const atDepot = atDepotQty(record)
  const resent = record.resentQty ?? 0

  if (atDepot === 0 && resent === 0) {
    return null
  }

  return (
    <div
      className={cn('flex flex-col items-start gap-0.5', className)}
      title={`${record.returnedQty} piece(s) came back off a trip; ${resent} went out again.`}
    >
      {atDepot > 0 && (
        <span className={cn(FLAG, 'text-tone-rose')}>
          <Undo2 className="size-3 shrink-0" aria-hidden />
          {atDepot} back at depot
        </span>
      )}
      {resent > 0 && (
        <span className={cn(FLAG, 'text-tone-cyan')}>
          <Repeat className="size-3 shrink-0" aria-hidden />
          {resent} re-sent
        </span>
      )}
    </div>
  )
}

/**
 * Where the goods are: the dispatch badge, how many pieces have gone as a bar
 * and a count, and what came back. Every figure is derived by the Delivery
 * module from the trips — nothing here is typed by anybody.
 */
export function DeliveryStatusCell({ record }: { record: ChallanRecord }) {
  const meta = dispatchMetaFor(record)
  const total = record.totalQty
  const sent = Math.min(record.dispatchedQty, total)
  const percent = total > 0 ? Math.round((sent / total) * 100) : 0

  return (
    <div className="flex w-32 flex-col items-start gap-1.5">
      <DispatchBadge record={record} hideQty />
      <div className="flex w-full items-center gap-2" title={meta.description}>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <div className={cn('h-full rounded-full', meta.dot)} style={{ width: `${percent}%` }} />
        </div>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {sent}/{total}
        </span>
      </div>
      <ReturnFlags record={record} />
    </div>
  )
}

/**
 * What the record is, then two quiet flags beneath it: whether its paper has
 * been printed, and — only when it wants attention — its location. One pill
 * per cell, so the primary status reads first and the rest reads as detail.
 */
export function RecordStatusCell({ record }: { record: ChallanRecord }) {
  const printedBy = record.printedBy ? ` by ${record.printedBy.name}` : ''
  const location = record.resolvedLocation
  const pending = LOCATION_STATUS_META.Pending
  const review = LOCATION_REVIEW_META

  return (
    <div className="flex flex-col items-start gap-1">
      <ChallanStatusBadge status={record.status} />

      {record.printedAt ? (
        <span
          className={cn(FLAG, 'text-tone-violet')}
          title={`Printed ${formatDateTime(record.printedAt)}${printedBy}`}
        >
          <PrinterCheck className="size-3 shrink-0" aria-hidden />
          Printed
        </span>
      ) : (
        <span className={cn(FLAG, 'text-muted-foreground')}>
          <Printer className="size-3 shrink-0" aria-hidden />
          Not printed
        </span>
      )}

      <BillingFlag status={record.billStatus} billNumbers={record.billNumbers} />

      {/* Never "Location set": the District / Thana column already says so. */}
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
            title={`${locationSourceLabel(location.source)}. Nobody has confirmed it yet.`}
          >
            <review.icon className="size-3 shrink-0" aria-hidden />
            {review.label} location
          </span>
        )
      )}
    </div>
  )
}
