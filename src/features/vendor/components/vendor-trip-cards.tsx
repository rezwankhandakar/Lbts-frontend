import type { ReactNode } from 'react'
import { CalendarDays, ChevronRight, FileText, UserRound } from 'lucide-react'
import { TripStatusBadge } from '@/features/delivery/components/delivery-badges'
import { BillAmount, PlateBadge } from '@/features/delivery/components/trip-cells'
import { shortTripNumber } from '@/features/delivery/lib/delivery-meta'
import type { VendorTripRecord } from '../types'
import { netOf, tripProgress } from '../lib/trip-figures'
import { countOf, useFormatters, useT } from '@/lib/i18n'

function Figure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold wrap-break-word tabular-nums">{children}</dd>
    </div>
  )
}

/**
 * The trips as cards, for everything narrower than the table needs — one to a
 * row on a phone, two from `sm`.
 *
 * A card is read top to bottom in the order a vendor asks: which trip and
 * where it stands, which lorry and who drove it, what it carried, and what it
 * came to. The three figures that make up the bill sit in a strip, and the net
 * amount — the one somebody is looking for — closes the card on a line of its
 * own at the largest size on it. The whole card is the button; the chevron
 * says so.
 */
export function VendorTripCards({
  records,
  onOpen,
}: {
  records: VendorTripRecord[]
  onOpen: (trip: VendorTripRecord) => void
}) {
  const t = useT()
  const format = useFormatters()

  return (
    <ul className="grid gap-3 bg-muted/30 p-3 sm:grid-cols-2 sm:p-4 xl:hidden">
      {records.map((trip) => (
        <li key={trip.id} className="min-w-0">
          <button
            type="button"
            onClick={() => onOpen(trip)}
            aria-label={t('vendor.trip.openAria', { trip: shortTripNumber(trip.tripNumber) })}
            className="group flex h-full w-full flex-col rounded-2xl border bg-card p-4 text-left shadow-xs transition outline-none hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex w-full items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-base font-bold tracking-tight">
                  {shortTripNumber(trip.tripNumber)}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                  {format.calendarDay(trip.tripDate)}
                </p>
              </div>
              <TripStatusBadge value={trip.status} progress={tripProgress(trip)} className="shrink-0" />
            </div>

            <div className="mt-3 flex w-full flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <PlateBadge plate={trip.registrationNo} className="text-[13px]" />
              <span className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground">
                <UserRound className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{trip.driverName}</span>
              </span>
            </div>

            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <FileText className="size-4 shrink-0" aria-hidden />
              <span>
                {countOf(trip.challanCount, 'nouns.challan', t)} · {countOf(trip.totalQty, 'nouns.pc', t)}
                {trip.returnedQty > 0 && (
                  <span className="font-medium text-tone-rose">
                    {' · '}
                    {t('vendor.trip.returned', { count: format.number(trip.returnedQty) })}
                  </span>
                )}
              </span>
            </p>

            <dl className="mt-3.5 grid w-full grid-cols-3 gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
              <Figure label={t('vendor.trip.tripRent')}>
                <BillAmount amount={trip.tripRent} className="text-sm" />
              </Figure>
              <Figure label={t('vendor.trip.labour')}>
                <BillAmount amount={trip.labourBill} className="text-sm" />
              </Figure>
              <Figure label={t('vendor.trip.advance')}>{format.taka(trip.advance)}</Figure>
            </dl>

            <div className="mt-auto flex w-full items-end justify-between gap-3 pt-3.5">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{t('vendor.trip.totalAmount')}</p>
                <p className="text-sm font-semibold tabular-nums">{format.taka(trip.bill)}</p>
              </div>
              <div className="flex min-w-0 items-end gap-2 text-right">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{t('vendor.trip.netAmount')}</p>
                  <p className="text-lg leading-tight font-bold tracking-tight tabular-nums">
                    {format.taka(netOf(trip))}
                  </p>
                </div>
                <ChevronRight
                  className="mb-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}
