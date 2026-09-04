import { Paperclip } from 'lucide-react'
import { formatTripDate, itemSummary } from '../lib/gate-pass-meta'
import type { GatePassRecord } from '../types'
import { GatePassActionMenu } from './gate-pass-action-menu'
import type { GatePassActions } from './gate-pass-action-menu'
import { GatePassStatusBadge } from './gate-pass-status-badge'

interface GatePassCardsProps {
  records: GatePassRecord[]
  actions: GatePassActions
  onOpen: (record: GatePassRecord) => void
}

/**
 * The phone and small-tablet view.
 *
 * Deliberately not a shrunken table: nine columns on a 375px screen is a
 * horizontal scrollbar and nothing readable. A card keeps the identifier and
 * the status on the first line — which is what somebody scanning a list is
 * looking for — and puts the rest underneath in the order it is asked about.
 */
export function GatePassCards({ records, actions, onOpen }: GatePassCardsProps) {
  return (
    <ul className="divide-y">
      {records.map((record) => (
        <li key={record.id} className="relative px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              className="min-w-0 flex-1 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onOpen(record)}
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">{record.gatePassId}</span>
                <GatePassStatusBadge status={record.status} />
                {record.document && (
                  <Paperclip
                    className="size-3 text-muted-foreground"
                    aria-label="Has a scanned document"
                  />
                )}
              </span>

              <span className="mt-1 block truncate text-[13px]">{record.customerName}</span>

              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {itemSummary(record)} · {record.totalQty}
              </span>

              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {formatTripDate(record.tripDate)} · {record.vehicleNo}
              </span>

              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                DO {record.tripDo} · {record.csd} · {record.unit}
              </span>
            </button>

            <div className="shrink-0">
              <GatePassActionMenu record={record} actions={actions} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
