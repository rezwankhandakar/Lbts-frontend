import { Building2, CircleAlert, Route, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OwnershipBadge, VehicleStatusBadge } from '@/features/vendor/components/status-badges'
import { VehicleAvatar } from '@/features/vendor/components/vendor-identity'
import { shortTripNumber } from '../lib/delivery-meta'
import type { TripVehicleOption } from '../types'
import { PlateText } from './delivery-badges'

interface VehicleResultItemProps {
  option: TripVehicleOption
  query: string
  active: boolean
  id: string
  onSelect: () => void
  onHover: () => void
}

/**
 * One vehicle in the search list.
 *
 * Read in the order an operator checks it: the plate — large, with the typed
 * digits in bold, because four lorries can end in 1234 — then who runs it and
 * who is driving it, then its state. An assigned driver who cannot drive is
 * named with the reason, so choosing this lorry and finding an empty driver
 * slot is never a surprise.
 */
export function VehicleResultItem({
  option,
  query,
  active,
  id,
  onSelect,
  onHover,
}: VehicleResultItemProps) {
  const { vehicle, vendor, currentDriver, openTrips } = option
  const description = [vehicle.brand, vehicle.model].filter(Boolean).join(' ')

  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      onMouseMove={onHover}
      className={cn(
        'flex cursor-pointer gap-3 rounded-lg border border-transparent p-3 transition-colors',
        active ? 'border-primary/30 bg-primary/5' : 'hover:bg-muted/60',
      )}
    >
      <VehicleAvatar
        photoUrl={vehicle.photoUrl}
        label={vehicle.registrationNo}
        caption={vehicle.vehicleCode}
        className="size-11"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <PlateText
            plate={vehicle.registrationNo}
            query={query}
            className="text-[15px] font-semibold"
          />
          <VehicleStatusBadge value={vehicle.status} />
        </div>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          <span className="font-mono">{vehicle.vehicleCode}</span>
          {description && ` · ${description}`}
        </p>

        <div className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <Building2 className="size-3.5 shrink-0 text-tone-emerald" aria-hidden />
            <span className="truncate font-medium">{vendor.name}</span>
          </span>

          <span className="flex min-w-0 items-center gap-1.5">
            {currentDriver && currentDriver.blocker ? (
              <CircleAlert className="size-3.5 shrink-0 text-tone-amber" aria-hidden />
            ) : (
              <UserRound className="size-3.5 shrink-0 text-tone-indigo" aria-hidden />
            )}
            <span className="truncate">
              {currentDriver ? (
                <>
                  <span className="font-medium">{currentDriver.name}</span>
                  {currentDriver.blocker && (
                    <span className="text-tone-amber"> · {currentDriver.status}</span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">No driver assigned</span>
              )}
            </span>
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <OwnershipBadge value={vehicle.ownershipType} />
          {openTrips.length > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-tone-amber/25 bg-tone-amber/10 px-2 py-0.5 text-[11px] font-semibold text-tone-amber"
              title={openTrips
                .map((trip) => `${shortTripNumber(trip.tripNumber)} (${trip.status})`)
                .join(', ')}
            >
              <Route className="size-3" aria-hidden />
              {openTrips.length === 1
                ? `On ${shortTripNumber(openTrips[0].tripNumber)}`
                : `${openTrips.length} open trips`}
            </span>
          )}
        </div>
      </div>
    </li>
  )
}
