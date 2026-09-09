import { Truck, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDay } from '../lib/vendor-meta'
import type { VehicleRecord } from '../types'
import { ComplianceChips, OwnershipBadge, VehicleStatusBadge } from './status-badges'
import { VehicleMenu } from './vehicle-table'
import type { VehicleActions } from './vehicle-table'

/**
 * The fleet on a narrow screen.
 *
 * A swap rather than a horizontally scrolling table, for the reason the vendor
 * directory swaps: seven columns on a 360px phone is a table nobody can read
 * and a scrollbar nobody finds.
 *
 * The card keeps the same reading order as the row — what it is, who is on it,
 * what state it is in — so somebody moving between a desktop and a phone is
 * looking at the same record laid out differently rather than at a different
 * summary of it.
 */
export function VehicleCards({
  records,
  actions,
}: {
  records: VehicleRecord[]
  actions: VehicleActions
}) {
  return (
    <ul className="divide-y md:hidden">
      {records.map((record) => (
        <li
          key={record.id}
          className={cn('p-4', record.status === 'Inactive' && 'opacity-60')}
        >
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tone-indigo/10 text-tone-indigo ring-1 ring-tone-indigo/20">
              <Truck className="size-4" aria-hidden />
            </span>

            <button
              type="button"
              onClick={() => actions.onOpen(record)}
              className="min-w-0 flex-1 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="text-sm font-medium wrap-break-word">{record.registrationNo}</p>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                {record.vehicleCode}
                {record.brand || record.model
                  ? ` · ${[record.brand, record.model].filter(Boolean).join(' ')}`
                  : ''}
              </p>
            </button>

            <VehicleMenu vehicle={record} actions={actions} />
          </div>

          <p className="mt-2.5 flex items-start gap-1.5 text-xs text-muted-foreground">
            <UserRound className="mt-px size-3.5 shrink-0" aria-hidden />
            {record.currentDriver ? (
              <span className="min-w-0">
                <span className="font-medium text-foreground">{record.currentDriver.name}</span>{' '}
                since {formatDay(record.currentDriver.assignedFrom)}
              </span>
            ) : (
              'No driver assigned'
            )}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <VehicleStatusBadge value={record.status} />
            <OwnershipBadge value={record.ownershipType} />
            <ComplianceChips tally={record.documents} />
          </div>
        </li>
      ))}
    </ul>
  )
}
