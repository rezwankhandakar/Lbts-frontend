import { MapPin, Phone } from 'lucide-react'
import { formatAmount, formatDate } from '@/lib/format'
import type { ChallanRecord } from '../types'
import { ChallanActionMenu } from './challan-action-menu'
import type { ChallanActions } from './challan-action-menu'
import { ChallanRecordFlags, DeliveryProgressBar, ReturnFlags } from './challan-card-cells'
import { ChallanStatusBadge, DispatchBadge } from './challan-status-badge'

interface ChallanCardProps {
  record: ChallanRecord
  actions: ChallanActions
  onOpen: (record: ChallanRecord) => void
}

/**
 * One challan, as a card rather than a row.
 *
 * Four flat sections in the order the paper is read: which challan, who and
 * where, the goods, and what it comes to. Deliberately the same shape the
 * Delivery module's `cart-challan-card.tsx` and `completion-challan-card.tsx`
 * use for the same subject — an operator meets a challan on three screens, and
 * it should look like the same thing on all of them.
 *
 * Flat is the point. The goods were a bordered table inside the card, which is
 * a panel inside a panel: two extra borders, a repeated column header and a
 * tint, to say what a divided list says on its own. Capacity went with it —
 * the rate card's band is not what somebody checking a delivery reads.
 *
 * The whole card opens the record on click; the challan number carries the
 * button that makes that reachable by keyboard, and the action menu stops the
 * click from reaching the card underneath it.
 */
export function ChallanCard({ record, actions, onOpen }: ChallanCardProps) {
  const district = record.resolvedLocation?.district || record.district
  const thana = record.resolvedLocation?.thana || record.thana

  return (
    <li
      onClick={() => onOpen(record)}
      aria-label={`Challan ${record.challanNumber}`}
      className="flex h-full cursor-pointer flex-col rounded-xl border bg-card shadow-xs transition-shadow focus-within:ring-2 focus-within:ring-ring/50 hover:shadow-sm"
    >
      <header className="flex items-start gap-3 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onOpen(record)
              }}
              className="font-mono text-sm font-bold tracking-tight outline-none hover:underline focus-visible:underline"
            >
              {record.challanNumber}
            </button>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              SL {record.slNumber}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatDate(record.submittedAt)}
            </span>
          </div>

          <p className="mt-1 text-sm font-semibold wrap-break-word">{record.customerName}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <ChallanStatusBadge status={record.status} />
            <DispatchBadge record={record} />
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-1">
          <p className="mt-0.5 text-sm font-semibold tabular-nums">{record.totalQty} pcs</p>
          <div onClick={(event) => event.stopPropagation()}>
            <ChallanActionMenu record={record} actions={actions} />
          </div>
        </div>
      </header>

      <div className="space-y-1 px-4 pt-3 text-xs text-muted-foreground">
        <p className="flex items-start gap-1.5">
          <MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
          <span className="min-w-0 wrap-break-word">
            {record.deliveryAddress || '—'}
            {/* Labelled halves rather than one joined string: a blank thana and
                a blank district are different gaps, and the card is where
                somebody notices which one is missing. */}
            <span className="block">
              Thana: <span className="text-foreground">{thana || '—'}</span> · District:{' '}
              <span className="text-foreground">{district || '—'}</span>
            </span>
          </span>
        </p>
        <p className="flex items-center gap-1.5">
          <Phone className="size-3.5 shrink-0" aria-hidden />
          <span className="font-medium text-foreground tabular-nums">
            {record.receiverMobile || '—'}
          </span>
        </p>
      </div>

      {/* Every line, not the first and a count: a challan routinely carries the
          indoor and outdoor halves of an air conditioner, and "+1 more" is
          exactly what somebody checking a load needs to read. */}
      <ul className="mt-1 divide-y px-4">
        {record.items.map((item, index) => (
          <li key={`${item.model}-${index}`} className="flex items-center gap-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium wrap-break-word">{item.productName}</p>
              <p className="font-mono text-xs wrap-break-word text-muted-foreground">
                {item.model || '—'}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums">× {item.qty}</span>
          </li>
        ))}
      </ul>

      <footer className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t bg-muted/20 px-4 py-2.5">
        {/* A charge that does not cover every line is marked: a partial total
            looks exactly like a complete one. */}
        <span
          className="text-sm font-semibold tabular-nums"
          title={
            record.unpricedItems > 0
              ? `${record.unpricedItems} of ${record.items.length} lines are not on the rate card for this location.`
              : undefined
          }
        >
          {record.totalAmount === null ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <>
              <span className="mr-0.5 text-xs font-normal text-muted-foreground">৳</span>
              {formatAmount(record.totalAmount)}
              {record.unpricedItems > 0 && (
                <span className="ml-0.5 text-tone-amber" aria-hidden>
                  *
                </span>
              )}
            </>
          )}
        </span>

        <DeliveryProgressBar record={record} />
        <ReturnFlags record={record} />
        <ChallanRecordFlags record={record} className="ml-auto justify-end" />
      </footer>
    </li>
  )
}
