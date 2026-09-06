import { MapPin, Package, Phone } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { formatRange, itemSummary } from '../lib/challan-meta'
import type { ChallanRecord } from '../types'
import { ChallanActionMenu } from './challan-action-menu'
import type { ChallanActions } from './challan-action-menu'
import { ChallanPrintMark } from './challan-print-mark'
import { ChallanStatusBadge } from './challan-status-badge'

interface ChallanCardsProps {
  records: ChallanRecord[]
  actions: ChallanActions
  onOpen: (record: ChallanRecord) => void
}

/**
 * The narrow-screen view.
 *
 * Not a table with columns hidden — a card, laid out for a phone. Eleven
 * columns squeezed onto 380px is a table nobody can read, and the fields that
 * matter on a small screen are a different set: who it is going to, where, and
 * what is in it.
 */
export function ChallanCards({ records, actions, onOpen }: ChallanCardsProps) {
  return (
    <ul className="divide-y">
      {records.map((record) => (
        <li key={record.id} className="px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => onOpen(record)}
              className="min-w-0 flex-1 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold">{record.challanNumber}</span>
                <ChallanStatusBadge status={record.status} />
                <ChallanPrintMark record={record} />
              </span>
              <span className="mt-1 block truncate text-sm font-medium">{record.customerName}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                SL {record.slNumber} · {formatDate(record.submittedAt)}
              </span>
            </button>

            <div onClick={(event) => event.stopPropagation()}>
              <ChallanActionMenu record={record} actions={actions} />
            </div>
          </div>

          <dl className="mt-3 grid gap-1.5 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
              {/* Joined rather than interpolated, because the thana and the
                  district are optional: a blank one would otherwise leave a
                  stray comma reading as a missing value nobody can act on. */}
              <dd className="min-w-0 flex-1 truncate">
                {[
                  record.deliveryAddress,
                  record.resolvedLocation?.thana || record.thana,
                  record.resolvedLocation?.district || record.district,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-3.5 shrink-0" aria-hidden />
              <dd>{record.receiverMobile}</dd>
            </div>
            <div className="flex items-start gap-2">
              <Package className="mt-px size-3.5 shrink-0" aria-hidden />
              <dd className="min-w-0 flex-1 truncate">
                {itemSummary(record)} × {record.totalQty}
              </dd>
            </div>
          </dl>

          <p className="mt-2.5 text-[11px] text-muted-foreground/80">
            {record.sourceFileName} ·{' '}
            {formatRange({
              startPage: record.sourcePageStart,
              endPage: record.sourcePageEnd,
            })}
          </p>
        </li>
      ))}
    </ul>
  )
}
