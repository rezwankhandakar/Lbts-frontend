import type { ReactNode } from 'react'
import { Building2, Clock3, Info, Phone, Truck, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { TripRecord } from '../types'

/**
 * Who ran the trip, and when it was put on the books — one row of chips on the
 * trip's brand band.
 *
 * One line rather than four columns, because it reads as one sentence —
 * "Vehicle DM-N-20-0254 · Vendor Kalam 01924471112 · Driver Kobir · Created
 * …" — and because the head of the page has to fit a laptop screen. What a
 * chip has no room for is in its tooltip: the vehicle's code, make and
 * ownership, and the assigned driver somebody else drove in place of.
 *
 * These are the copies taken at confirmation, not live reads, so a driver
 * whose number changed next month still shows the number they had on this
 * run. Both numbers are `tel:` links because the page is read on a phone as
 * often as at a desk; the vendor links through to the fleet.
 *
 * Below `sm` the chips are cut down so the band stays short on a phone: the
 * label goes (the icon already says which chip is which, and a screen reader
 * still hears it), the padding tightens, and a phone number becomes a round
 * tap-to-call button — on a phone, calling is what the number is there for.
 * With labels and numbers on, the four chips took a line each and the band
 * filled the screen before the first challan.
 */
export function TripHeroFacts({ trip }: { trip: TripRecord }) {
  const t = useT()
  const format = useFormatters()

  const vehicleLine = [
    trip.vehicle.vehicleCode,
    [trip.vehicle.brand, trip.vehicle.model].filter(Boolean).join(' '),
    trip.vehicle.ownershipType,
  ]
    .filter(Boolean)
    .join(' · ')

  const override = trip.driverIsOverride && trip.assignedDriver
    ? t('delivery.driver.droveInPlace', { name: trip.assignedDriver.name })
    : undefined

  return (
    <div className="flex flex-wrap gap-1.5">
      <Fact icon={Truck} label={t('delivery.vehicle.heading')} title={vehicleLine}>
        <span className="font-mono font-bold">{trip.vehicle.registrationNo}</span>
      </Fact>

      <Fact icon={Building2} label={t('delivery.vendor.heading')}>
        <Link to={`/vendors/${trip.vendor.id}`} className="font-semibold hover:underline">
          {trip.vendor.name}
        </Link>
        <Tel value={trip.vendor.mobile} />
      </Fact>

      <Fact icon={UserRound} label={t('delivery.driver.heading')} title={override}>
        <span className="inline-flex items-center gap-1 font-semibold">
          {trip.driver.name}
          {override && <Info className="size-3 text-primary-foreground/70" aria-label={override} />}
        </span>
        <Tel value={trip.driver.mobile} />
      </Fact>

      <Fact icon={Clock3} label={t('common.labels.createdAt')}>
        <span className="font-semibold">{format.dateTime(trip.createdAt)}</span>
        {trip.createdBy && <span className="text-primary-foreground/80">· {trip.createdBy.name}</span>}
      </Fact>
    </div>
  )
}

function Fact({
  icon: Icon,
  label,
  title,
  children,
}: {
  icon: LucideIcon
  label: string
  title?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex max-w-full min-w-0 items-center gap-1.5 rounded-lg bg-primary-foreground/10 px-2 py-1 text-[13px] ring-1 ring-primary-foreground/15 sm:gap-2 sm:px-2.5 sm:py-1.5',
        title && 'cursor-help',
      )}
      title={title}
    >
      <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden />
      <span className="sr-only text-[10px] font-semibold tracking-[0.12em] text-primary-foreground/70 uppercase sm:not-sr-only">
        {label}
      </span>
      <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 sm:gap-x-2">{children}</span>
    </div>
  )
}

/**
 * Below `sm` a 24px round button whose hit area is widened to 36px by an
 * invisible overlay — the Delivery module's smallest control — so the chip
 * stays short and the number is still one tap from a call. The number stays
 * in the link as screen-reader text, so it remains the link's name.
 */
function Tel({ value }: { value: string }) {
  return value ? (
    <a
      href={`tel:${value}`}
      title={value}
      className="relative inline-flex size-6 items-center justify-center gap-1 rounded-full bg-primary-foreground/15 text-xs text-primary-foreground/85 tabular-nums after:absolute after:-inset-1.5 hover:text-primary-foreground hover:underline sm:size-auto sm:rounded-none sm:bg-transparent sm:after:hidden"
    >
      <Phone className="size-3" aria-hidden />
      <span className="sr-only sm:not-sr-only">{value}</span>
    </a>
  ) : null
}
