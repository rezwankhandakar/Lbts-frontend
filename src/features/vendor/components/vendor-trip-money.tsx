import { taka } from '@/features/delivery/lib/delivery-meta'
import { vendorStatusMeta as billStatusMeta } from '@/features/accounts/lib/accounts-meta'
import { formatDay } from '../lib/vendor-meta'
import type { VendorMonthlyBill, VendorTripDetail, VendorTripMoneyEntry } from '../types'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * Where the month stands — no bill yet, unpaid, partly paid, paid, overpaid —
 * in Accounts' own words and colours, so it says exactly what the Vendor Bills
 * page says about the same month. Drawn for a card surface.
 */
export function BillStatusBadge({
  status,
  className,
}: {
  status: VendorMonthlyBill['status']
  className?: string
}) {
  const t = useT()
  const meta = billStatusMeta(status, t)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1',
        meta.badge,
        className,
      )}
    >
      {meta.label}
    </span>
  )
}

function Figure({
  label,
  children,
  strong = false,
}: {
  label: string
  children: React.ReactNode
  strong?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={strong ? 'text-base font-semibold tabular-nums' : 'text-sm tabular-nums'}>
        {children}
      </dd>
    </div>
  )
}

function EntryList({
  title,
  entries,
  empty,
}: {
  title: string
  entries: VendorTripMoneyEntry[]
  empty: string
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {entries.map((entry) => (
            <li
              key={entry.entryNumber}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <span className="min-w-0">
                <span className="font-mono">{entry.entryNumber}</span>
                <span className="text-muted-foreground"> · {formatDay(entry.date)}</span>
              </span>
              <span className="font-semibold tabular-nums">{taka(entry.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * A trip's money: what it was billed and what was advanced against it. Paid and
 * due are not here — a payment names a month, so they are the monthly bill's,
 * shown above the trip list.
 */
export function VendorTripMoney({ trip }: { trip: VendorTripDetail }) {
  const t = useT()

  const notEntered = <span className="text-tone-rose">{t('vendor.trip.notEntered')}</span>
  return (
    <div className="space-y-4">
      <dl className="divide-y">
        <Figure label={t('vendor.trip.tripRent')}>
          {trip.tripRent === null ? notEntered : taka(trip.tripRent)}
        </Figure>
        <Figure label={t('vendor.trip.labourBill')}>
          {trip.labourBill === null ? notEntered : taka(trip.labourBill)}
        </Figure>
        <Figure label={t('vendor.trip.totalAmount')} strong>
          {taka(trip.bill)}
        </Figure>
        <Figure label={t('vendor.trip.advance')}>{taka(trip.advance)}</Figure>
        <Figure label={t('vendor.trip.netAmount')} strong>
          {taka(trip.bill - trip.advance)}
        </Figure>
      </dl>

      <EntryList
        title={t('vendor.trip.advancesAgainst')}
        entries={trip.advances}
        empty={t('vendor.trip.noAdvance')}
      />
    </div>
  )
}
