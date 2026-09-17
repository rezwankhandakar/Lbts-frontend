import type { ReactNode } from 'react'
import { plural, taka } from '@/features/delivery/lib/delivery-meta'
import type { VendorMonthlyBill } from '../types'
import { DueAmount } from './vendor-trip-money'

function Tile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg border bg-muted/30 px-2.5 py-2 sm:px-3">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold wrap-break-word tabular-nums">{value}</dd>
    </div>
  )
}

/**
 * The vendor's monthly bill above the trip list: billed, advanced, paid, due.
 *
 * Paid and due live here and on no trip row, because a vendor payment names a
 * month rather than a trip. So these figures cover **every trip in the whole
 * months the date range touches**, whatever search or status is applied — the
 * same figures the Vendor Bills page in Accounts shows for those months.
 */
export function MonthlyBill({ bill }: { bill: VendorMonthlyBill }) {
  return (
    <section aria-label="Monthly bill" className="space-y-1.5">
      <p className="text-xs font-medium">
        Monthly bill · {bill.label}
        <span className="font-normal text-muted-foreground">
          {' '}
          · {plural(bill.tripCount, 'trip')}
        </span>
        {bill.blankBills > 0 && (
          <span className="font-normal text-tone-rose">
            {' '}
            · {plural(bill.blankBills, 'trip')} without a full bill
          </span>
        )}
      </p>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tile label="Total amount" value={taka(bill.totalBill)} />
        <Tile label="Advance" value={taka(bill.advance)} />
        <Tile label="Paid" value={taka(bill.paid)} />
        <Tile label="Due" value={<DueAmount value={bill.due} />} />
      </dl>
    </section>
  )
}
