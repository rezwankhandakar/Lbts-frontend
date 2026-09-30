import { taka } from '@/features/delivery/lib/delivery-meta'
import { formatDay } from '../lib/vendor-meta'
import type { VendorTripDetail, VendorTripMoneyEntry } from '../types'
import { useT } from '@/lib/i18n'

/**
 * What is still owed, in words that do not need a sign read: an amount owed,
 * "Paid" at zero, and "Overpaid" when advances and payments ran past the bill.
 */
export function DueAmount({ value }: { value: number }) {
  const t = useT()

  if (value > 0) {
    return <span className="font-semibold text-tone-rose">{taka(value)}</span>
  }
  if (value === 0) {
    return <span className="font-semibold text-tone-emerald">{t('vendor.trip.paid')}</span>
  }
  return (
    <span
      className="font-semibold text-tone-amber"
      title={t('vendor.trip.overpaidTitle')}
    >
      {t('vendor.trip.overpaid', { amount: taka(-value) })}
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
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className={strong ? 'text-sm font-semibold tabular-nums' : 'text-[13px] tabular-nums'}>
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
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {entries.map((entry) => (
            <li
              key={entry.entryNumber}
              className="flex items-center justify-between gap-3 px-2.5 py-1.5 text-xs"
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
