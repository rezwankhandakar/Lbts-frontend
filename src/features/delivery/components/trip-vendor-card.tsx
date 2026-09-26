import { Phone } from 'lucide-react'
import { VendorStatusBadge } from '@/features/vendor/components/status-badges'
import { VendorAvatar } from '@/features/vendor/components/vendor-identity'
import type { TripVendorRef } from '../types'
import { useT } from '@/lib/i18n'

/**
 * Who runs the vehicle — and so who this trip is assigned to and numbered
 * under. Read off the vehicle and never chosen: the server does the same, and a
 * trip's vendor is not a field anybody can set.
 */
export function TripVendorCard({ vendor }: { vendor: TripVendorRef }) {
  const t = useT()

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-4">
      <p className="text-[11px] font-semibold tracking-wide text-tone-emerald uppercase">{t('delivery.vendor.heading')}</p>

      <div className="mt-2 flex items-start gap-3">
        <VendorAvatar name={vendor.name} photoUrl={null} caption={vendor.vendorCode} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold wrap-break-word">{vendor.name}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{vendor.vendorCode}</p>
        </div>
        <VendorStatusBadge value={vendor.status} />
      </div>

      <dl className="mt-auto grid gap-1.5 pt-3 text-xs">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">{t('delivery.vendor.mobile')}</dt>
          <dd>
            {vendor.mobile ? (
              <a
                href={`tel:${vendor.mobile}`}
                className="inline-flex items-center gap-1 font-medium tabular-nums hover:underline"
              >
                <Phone className="size-3" aria-hidden />
                {vendor.mobile}
              </a>
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">{t('delivery.vendor.tripNumber')}</dt>
          <dd className="font-mono text-muted-foreground">{vendor.vendorCode}-TRIP-…</dd>
        </div>
      </dl>
    </div>
  )
}
