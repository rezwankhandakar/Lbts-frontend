import { MapPin } from 'lucide-react'
import { DeliveryOutcomeBadge } from '@/features/delivery/components/delivery-badges'
import { BLANK } from '@/lib/format'
import { useFormatters, useT } from '@/lib/i18n'
import type { VendorTripDetail } from '../types'

/**
 * A trip's challans in its detail sheet, one card each: which challan, where it
 * went, whether its delivery is finished, and what was on it line by line.
 *
 * Where it went is the delivery address with the thana and district under it,
 * the order a Bangladeshi address is read in — smallest to largest. No customer
 * name and no receiver's number: a Vendor account reads this, and the record it
 * comes from never carries them.
 */
export function VendorTripChallans({ challans }: { challans: VendorTripDetail['challans'] }) {
  const t = useT()
  const format = useFormatters()

  return (
    <ul className="space-y-2.5">
      {challans.map((challan) => (
        <li key={challan.challanNumber} className="space-y-2.5 rounded-xl border bg-card p-3.5">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
            <div className="min-w-0">
              <p className="font-mono text-sm font-semibold">{challan.challanNumber}</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {t('vendor.trip.slNumber', { sl: challan.slNumber })}
              </p>
            </div>
            <DeliveryOutcomeBadge
              value={
                challan.completionMethod ? t('vendor.trip.complete') : t('vendor.trip.pending')
              }
              method={challan.completionMethod}
            />
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm leading-relaxed wrap-break-word">
                {challan.deliveryAddress || BLANK}
              </p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {t('vendor.trip.place', {
                  thana: challan.thana || BLANK,
                  district: challan.district || BLANK,
                })}
              </p>
            </div>
          </div>
          <ul className="divide-y rounded-lg bg-muted/40 text-sm">
            {challan.lines.map((line, index) => (
              <li
                key={`${line.productName}-${line.model}-${index}`}
                className="flex justify-between gap-3 px-3 py-2"
              >
                <span className="min-w-0 wrap-break-word">
                  {line.productName}
                  {line.model && <span className="text-muted-foreground"> · {line.model}</span>}
                </span>
                <span className="shrink-0 text-right tabular-nums">
                  × {format.number(line.qty)}
                  {line.returnedQty > 0 && (
                    <span className="block text-[13px] text-tone-rose">
                      {t('vendor.trip.returned', { count: format.number(line.returnedQty) })}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
