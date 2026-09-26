import { MapPin, Phone, StickyNote } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { PARTY_LABEL_KEYS, whereOf } from '../lib/delivery-meta'
import type { TripChallanRecord } from '../types'

/**
 * Where a challan on a trip is going and who takes it: the address with its
 * thana and district, the receiver's number, the trip's note, and which of
 * those the trip changed from the paper.
 *
 * Shared by the trip manifest and the delivery page, so the two can never
 * disagree about what a delivery's address block says.
 */
export function ChallanPartyDetails({
  challan,
  className,
}: {
  challan: TripChallanRecord
  className?: string
}) {
  const t = useT()

  const where = whereOf(challan)

  return (
    <div className={cn('space-y-1 text-xs text-muted-foreground', className)}>
      <p className="flex items-start gap-1.5">
        <MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
        <span className="min-w-0 wrap-break-word">
          {challan.deliveryAddress}
          <span className="block">
            {t('delivery.cart.where', { thana: where.thana, district: where.district })}
          </span>
        </span>
      </p>
      <p className="flex items-center gap-1.5">
        <Phone className="size-3.5 shrink-0" aria-hidden />
        <span className="font-medium text-foreground tabular-nums">{challan.receiverMobile}</span>
      </p>
      {challan.note && (
        <p className="flex items-start gap-1.5">
          <StickyNote className="mt-px size-3.5 shrink-0" aria-hidden />
          <span className="italic">{challan.note}</span>
        </p>
      )}
      {challan.edited.length > 0 && (
        <p className="rounded-md bg-tone-amber/10 px-2 py-1 text-[11px] text-tone-amber">
          {t('delivery.cart.changedForThisTrip')}{' '}
          {challan.edited
            .map((field) =>
              t('delivery.cart.editedField', {
                label: t(PARTY_LABEL_KEYS[field]),
                was: challan.original[field] || t('delivery.cart.blankValue'),
              }),
            )
            .join('; ')}
        </p>
      )}
    </div>
  )
}
