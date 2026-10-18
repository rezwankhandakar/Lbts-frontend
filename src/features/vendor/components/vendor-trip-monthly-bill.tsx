import type { ReactNode } from 'react'
import { CircleDashed } from 'lucide-react'
import type { VendorMonthlyBill } from '../types'
import { dueReading } from '../lib/trip-figures'
import { BillStatusBadge } from './vendor-trip-money'
import { countOf, useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

function Tile({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0 rounded-xl border bg-muted/30 px-3.5 py-3', className)}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-base font-semibold wrap-break-word tabular-nums sm:text-lg">{children}</dd>
    </div>
  )
}

/**
 * The vendor's monthly bill on the staff Trips tab: billed, advanced, paid, due.
 * A vendor's own page draws the same figures in its hero instead
 * (`MyVendorBill`).
 *
 * Paid and due live here and on no trip row, because a vendor payment names a
 * month rather than a trip. So these figures cover **every trip in the whole
 * months the date range touches**, whatever search or status is applied — the
 * same figures the Vendor Bills page in Accounts shows for those months.
 */
export function MonthlyBill({ bill, period }: { bill: VendorMonthlyBill; period: string }) {
  const t = useT()
  const format = useFormatters()
  const due = dueReading(bill.due, t)

  return (
    <section aria-label={t('vendor.trip.monthlyBillAria')} className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h3 className="text-sm font-semibold">{t('vendor.trip.billFor', { period })}</h3>
        <span className="text-[13px] text-muted-foreground">
          {countOf(bill.tripCount, 'nouns.trip', t)}
        </span>
        {bill.blankBills > 0 && (
          <span className="inline-flex items-center gap-1 text-[13px] font-medium text-tone-rose">
            <CircleDashed className="size-3.5" aria-hidden />
            {t('vendor.trip.withoutFullBill', {
              trips: countOf(bill.blankBills, 'nouns.trip', t),
            })}
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Tile label={t('vendor.trip.totalAmount')}>{format.taka(bill.totalBill)}</Tile>
        <Tile label={t('vendor.trip.advance')}>{format.taka(bill.advance)}</Tile>
        <Tile label={t('vendor.trip.paid')}>{format.taka(bill.paid)}</Tile>
        <Tile label={due.label} className="bg-card shadow-xs">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={due.tone}>{format.taka(due.amount)}</span>
            <BillStatusBadge status={bill.status} />
          </span>
        </Tile>
      </dl>
    </section>
  )
}
