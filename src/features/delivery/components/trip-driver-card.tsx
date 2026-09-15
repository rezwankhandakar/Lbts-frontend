import { ArrowLeftRight, Phone, TriangleAlert, UserPlus, UserRoundX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DocumentStatusBadge,
  DriverStatusBadge,
} from '@/features/vendor/components/status-badges'
import { DriverAvatar } from '@/features/vendor/components/vendor-identity'
import type { TripDriverChoice } from '../hooks/use-trip-workspace'
import type { TripDriverRef } from '../types'

interface TripDriverCardProps {
  driver: TripDriverChoice | null
  /** The vehicle's assigned driver, from the assignment collection. */
  assigned: TripDriverRef | null
  onChange: () => void
  onAdd: () => void
  onUseAssigned: () => void
  canAdd: boolean
  disabled?: boolean
}

/**
 * Who drives this run.
 *
 * The vehicle's assigned driver is only the default. Choosing somebody else
 * changes this trip and nothing else — the card says so in as many words,
 * because the natural worry is "have I just taken Rahim off his lorry?", and
 * the answer is no.
 */
export function TripDriverCard({
  driver,
  assigned,
  onChange,
  onAdd,
  onUseAssigned,
  canAdd,
  disabled,
}: TripDriverCardProps) {
  const isOverride = driver !== null && assigned !== null && driver.id !== assigned.id
  const canRestore = isOverride && assigned?.blocker === null

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-wide text-tone-indigo uppercase">
          {isOverride ? 'Driver for this trip' : 'Driver'}
        </p>
        {driver && !isOverride && assigned && (
          <span className="text-[11px] text-muted-foreground">Assigned to this vehicle</span>
        )}
      </div>

      {driver ? (
        <div className="mt-2 flex items-start gap-3">
          <DriverAvatar name={driver.name} photoUrl={driver.photoUrl} caption={driver.driverCode} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold wrap-break-word">{driver.name}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{driver.driverCode}</p>
          </div>
          <DriverStatusBadge value={driver.status} />
        </div>
      ) : (
        <EmptyDriver assigned={assigned} />
      )}

      {driver && (
        <dl className="mt-3 grid gap-1.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">Mobile</dt>
            <dd>
              <a
                href={`tel:${driver.mobile}`}
                className="inline-flex items-center gap-1 font-medium tabular-nums hover:underline"
              >
                <Phone className="size-3" aria-hidden />
                {driver.mobile}
              </a>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">Licence</dt>
            <dd className="flex min-w-0 items-center gap-1.5">
              <span className="truncate font-mono">{driver.licenseNumber || 'Not recorded'}</span>
              {driver.licenceStatus && <DocumentStatusBadge value={driver.licenceStatus} />}
            </dd>
          </div>
          {driver.licencePhrase && (
            <p className="text-right text-[11px] text-muted-foreground">{driver.licencePhrase}</p>
          )}
        </dl>
      )}

      {driver?.licenceStatus === 'Expired' && (
        <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-tone-rose/10 px-2.5 py-1.5 text-[11px] text-tone-rose">
          <TriangleAlert className="mt-px size-3 shrink-0" aria-hidden />
          The licence has expired. The trip can still be confirmed — check it before dispatch.
        </p>
      )}

      {isOverride && (
        <p className="mt-2 rounded-lg bg-muted/60 px-2.5 py-1.5 text-[11px] leading-snug text-muted-foreground">
          {assigned?.name} stays the vehicle&apos;s assigned driver. This changes who drives this
          trip only.
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-3">
        <Button type="button" variant="outline" size="sm" onClick={onChange} disabled={disabled}>
          <ArrowLeftRight data-icon="inline-start" aria-hidden />
          {driver ? 'Change driver' : 'Choose driver'}
        </Button>
        {canAdd && (
          <Button type="button" variant="ghost" size="sm" onClick={onAdd} disabled={disabled}>
            <UserPlus data-icon="inline-start" aria-hidden />
            Add new driver
          </Button>
        )}
        {canRestore && (
          <Button type="button" variant="link" size="sm" onClick={onUseAssigned} disabled={disabled}>
            Use {assigned?.name}
          </Button>
        )}
      </div>
    </div>
  )
}

function EmptyDriver({ assigned }: { assigned: TripDriverRef | null }) {
  return (
    <div className="mt-2 flex items-start gap-3 rounded-lg border border-dashed p-3">
      <UserRoundX className="mt-0.5 size-5 shrink-0 text-tone-amber" aria-hidden />
      <p className="text-xs leading-snug text-muted-foreground">
        {assigned ? (
          <>
            <span className="font-medium text-foreground">{assigned.name}</span> is assigned to this
            vehicle but cannot drive — {assigned.blocker?.replace(/^The driver is /, 'they are ')}{' '}
            Choose another driver for this trip.
          </>
        ) : (
          'This vehicle has no assigned driver. Choose who drives this trip, or add a new driver.'
        )}
      </p>
    </div>
  )
}
