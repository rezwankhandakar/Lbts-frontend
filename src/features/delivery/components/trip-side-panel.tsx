import { Building2, Phone, Truck, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { formatDateTime } from '@/lib/format'
import { formatDay } from '@/features/vendor/lib/vendor-meta'
import type { TripRecord } from '../types'
import { useT } from '@/lib/i18n'

function Block({
  icon,
  title,
  tone,
  children,
}: {
  icon: ReactNode
  title: string
  tone: string
  children: ReactNode
}) {
  return (
    <div className="px-4 py-3">
      <p className={`flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase ${tone}`}>
        {icon}
        {title}
      </p>
      <div className="mt-1.5 space-y-0.5 text-sm">{children}</div>
    </div>
  )
}

function Tel({ value }: { value: string }) {
  return value ? (
    <a href={`tel:${value}`} className="inline-flex items-center gap-1 text-xs tabular-nums hover:underline">
      <Phone className="size-3" aria-hidden />
      {value}
    </a>
  ) : null
}

/**
 * Who ran the trip, and when it ended — as the trip recorded them.
 *
 * These are the copies taken at confirmation, not live reads, so a driver
 * whose number changed next month still shows the number they had on this
 * run. The vendor links through to the fleet because that is where somebody
 * reading a trip goes next.
 *
 * There is one stamp for the end rather than two for the middle: `Completed`
 * is the moment the last challan on the trip was signed for, derived from the
 * challans themselves. The `Dispatched` and `Delivered` stamps that used to
 * sit here recorded when somebody pressed a button, which is the thing this
 * module stopped treating as evidence.
 */
export function TripSidePanel({ trip }: { trip: TripRecord }) {
  const t = useT()

  const stamps: [string, string | null, string | null][] = [
    ['Created', trip.createdAt, trip.createdBy?.name ?? null],
    ['Completed', trip.completedAt, null],
  ]

  return (
    <div className="divide-y overflow-hidden rounded-xl border bg-card shadow-sm">
      <Block icon={<Truck className="size-3.5" aria-hidden />} title={t('delivery.vehicle.heading')} tone="text-primary">
        <p className="font-mono text-base font-bold">{trip.vehicle.registrationNo}</p>
        <p className="text-xs text-muted-foreground">
          {trip.vehicle.vehicleCode}
          {[trip.vehicle.brand, trip.vehicle.model].filter(Boolean).length > 0 &&
            ` · ${[trip.vehicle.brand, trip.vehicle.model].filter(Boolean).join(' ')}`}
          {` · ${trip.vehicle.ownershipType}`}
        </p>
      </Block>

      <Block icon={<Building2 className="size-3.5" aria-hidden />} title={t('delivery.vendor.heading')} tone="text-tone-emerald">
        <Link to={`/vendors/${trip.vendor.id}`} className="font-medium hover:underline">
          {trip.vendor.name}
        </Link>
        <p className="text-xs text-muted-foreground">
          {trip.vendor.vendorCode} · trip #{trip.vendorTripSerial}
        </p>
        <Tel value={trip.vendor.mobile} />
      </Block>

      <Block icon={<UserRound className="size-3.5" aria-hidden />} title={t('delivery.driver.heading')} tone="text-tone-indigo">
        <p className="font-medium">{trip.driver.name}</p>
        <p className="text-xs text-muted-foreground">
          {trip.driver.driverCode}
          {trip.driver.licenseNumber && ` · Licence ${trip.driver.licenseNumber}`}
          {trip.driver.licenseExpiry && ` (expires ${formatDay(trip.driver.licenseExpiry)})`}
        </p>
        <Tel value={trip.driver.mobile} />
        {trip.driverIsOverride && trip.assignedDriver && (
          <p className="mt-1 rounded-md bg-muted/60 px-2 py-1 text-[11px] text-muted-foreground">
            {t('delivery.driver.droveInPlace', { name: trip.assignedDriver.name })}
          </p>
        )}
      </Block>

      <div className="px-4 py-3">
        <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {t('delivery.trip.history')}
        </p>
        <ol className="mt-2 space-y-2">
          {stamps.map(([label, at, by]) => (
            <li key={label} className="flex items-start gap-2 text-xs">
              <span
                className={`mt-1 size-2 shrink-0 rounded-full ${at ? 'bg-success' : 'bg-muted-foreground/30'}`}
                aria-hidden
              />
              <span className="min-w-0">
                <span className="font-medium">{label}</span>{' '}
                <span className="text-muted-foreground">
                  {at
                    ? by
                      ? t('delivery.trip.byAt', { when: formatDateTime(at), name: by })
                      : formatDateTime(at)
                    : t('delivery.trip.notYet')}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {trip.note && (
        <div className="px-4 py-3 text-xs">
          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{t('delivery.trip.note')}</p>
          <p className="mt-1 whitespace-pre-wrap">{trip.note}</p>
        </div>
      )}
    </div>
  )
}
