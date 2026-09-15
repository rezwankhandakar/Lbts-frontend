import { ArrowLeftRight, Route, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ComplianceChips,
  OwnershipBadge,
  VehicleStatusBadge,
} from '@/features/vendor/components/status-badges'
import { VehicleAvatar } from '@/features/vendor/components/vendor-identity'
import { shortTripNumber } from '../lib/delivery-meta'
import type { TripVehicleOption } from '../types'

interface TripVehicleCardProps {
  option: TripVehicleOption
  onChange: () => void
  disabled?: boolean
}

/**
 * The chosen vehicle, as the summary the rest of the trip hangs from.
 *
 * The plate is the largest thing on the card because it is what the operator
 * checks against the lorry in front of them. Compliance is a warning and never
 * a block — an expiring fitness certificate is somebody's job this week, not a
 * reason to hold a lorry that is legally on the road today.
 */
export function TripVehicleCard({ option, onChange, disabled }: TripVehicleCardProps) {
  const { vehicle, openTrips, blocker } = option
  const description = [vehicle.brand, vehicle.model].filter(Boolean).join(' ')

  return (
    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/6 via-card to-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <VehicleAvatar
          photoUrl={vehicle.photoUrl}
          label={vehicle.registrationNo}
          caption={vehicle.vehicleCode}
          className="size-14 rounded-xl"
        />

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Vehicle
          </p>
          <p className="mt-0.5 font-mono text-xl font-bold tracking-tight wrap-break-word sm:text-2xl">
            {vehicle.registrationNo}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="font-mono">{vehicle.vehicleCode}</span>
            {description ? ` · ${description}` : ' · No brand or model recorded'}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <VehicleStatusBadge value={vehicle.status} />
            <OwnershipBadge value={vehicle.ownershipType} />
            <ComplianceChips tally={{ ...vehicle.documents }} />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onChange}
          disabled={disabled}
          className="self-start"
        >
          <ArrowLeftRight data-icon="inline-start" aria-hidden />
          Change vehicle
        </Button>
      </div>

      {openTrips.length > 0 && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-tone-amber/10 px-3 py-2 text-xs text-tone-amber">
          <Route className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>
            Already on{' '}
            {openTrips
              .map((trip) => `${shortTripNumber(trip.tripNumber)} (${trip.status})`)
              .join(', ')}
            .
            A second trip is fine for a lorry doing two runs — just make sure it is the same one.
          </span>
        </p>
      )}

      {blocker && (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>
            This vehicle cannot take a trip now. {blocker} Choose another vehicle from the same
            vendor.
          </span>
        </p>
      )}
    </div>
  )
}
