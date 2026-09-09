import { IdCard, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DriverRecord } from '../types'
import { ComplianceChips, DocumentStatusBadge, DriverStatusBadge } from './status-badges'
import { DriverMenu } from './driver-table'
import type { DriverActions } from './driver-table'
import { DriverAvatar } from './vendor-identity'

/**
 * The drivers on a narrow screen.
 *
 * The NID is absent here too, and for the same reason it is absent from the
 * table: the API does not send it on a list shape at all, so there is nothing to
 * leak onto a phone screen somebody is holding in a yard.
 */
export function DriverCards({
  records,
  actions,
}: {
  records: DriverRecord[]
  actions: DriverActions
}) {
  return (
    <ul className="divide-y md:hidden">
      {records.map((record) => (
        <li key={record.id} className={cn('p-4', record.status === 'Inactive' && 'opacity-60')}>
          <div className="flex items-start gap-3">
            <DriverAvatar
              name={record.name}
              photoUrl={record.photoUrl}
              className="size-10"
            />

            <button
              type="button"
              onClick={() => actions.onOpen(record)}
              className="min-w-0 flex-1 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="text-sm font-medium wrap-break-word">{record.name}</p>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                {record.driverCode} · {record.mobile}
              </p>
            </button>

            <DriverMenu driver={record} actions={actions} />
          </div>

          <div className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
            <p className="flex items-start gap-1.5">
              <IdCard className="mt-px size-3.5 shrink-0" aria-hidden />
              {record.licenseNumber ? (
                <span className="min-w-0">
                  <span className="font-medium text-foreground">{record.licenseNumber}</span>
                  {record.licencePhrase ? ` · ${record.licencePhrase}` : ''}
                </span>
              ) : (
                'No licence recorded'
              )}
            </p>

            <p className="flex items-start gap-1.5">
              <Truck className="mt-px size-3.5 shrink-0" aria-hidden />
              {record.currentVehicle ? (
                <span className="font-medium text-foreground">
                  {record.currentVehicle.registrationNo}
                </span>
              ) : (
                'Not assigned to a vehicle'
              )}
            </p>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <DriverStatusBadge value={record.status} />
            {record.licenceStatus && record.licenceStatus !== 'Valid' && (
              <DocumentStatusBadge value={record.licenceStatus} />
            )}
            <ComplianceChips tally={record.documents} />
          </div>
        </li>
      ))}
    </ul>
  )
}
