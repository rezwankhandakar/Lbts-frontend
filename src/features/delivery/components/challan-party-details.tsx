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
 * Shared by the trip page's challan cards and the delivery page, so the two
 * can never disagree about what a delivery's address block says. They differ
 * only in how it is laid out: `plain` is the delivery page's stack of small
 * muted lines; `card` is the trip page's, where a laptop screen has to hold
 * two rows of cards — the address in body text clamped to two lines, and the
 * thana, district and receiver's number sharing the line beneath it.
 */
export function ChallanPartyDetails({
  challan,
  className,
  variant = 'plain',
}: {
  challan: TripChallanRecord
  className?: string
  variant?: 'plain' | 'card'
}) {
  const t = useT()

  const where = whereOf(challan)
  const whereText = t('delivery.cart.where', { thana: where.thana, district: where.district })

  const edited =
    challan.edited.length > 0 ? (
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
    ) : null

  if (variant === 'card') {
    return (
      <div className={cn('space-y-1.5', className)}>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[13px] leading-snug wrap-break-word" title={challan.deliveryAddress}>
              {challan.deliveryAddress}
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span>{whereText}</span>
              {challan.receiverMobile && (
                <a
                  href={`tel:${challan.receiverMobile}`}
                  className="inline-flex items-center gap-1 font-medium text-foreground tabular-nums hover:underline"
                >
                  <Phone className="size-3 text-primary" aria-hidden />
                  {challan.receiverMobile}
                </a>
              )}
            </p>
          </div>
        </div>
        {challan.note && (
          <p className="flex items-start gap-2 text-xs text-muted-foreground italic">
            <StickyNote className="mt-px size-3.5 shrink-0 not-italic" aria-hidden />
            <span className="min-w-0 wrap-break-word">{challan.note}</span>
          </p>
        )}
        {edited}
      </div>
    )
  }

  return (
    <div className={cn('space-y-1 text-xs text-muted-foreground', className)}>
      <p className="flex items-start gap-1.5">
        <MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
        <span className="min-w-0 wrap-break-word">
          {challan.deliveryAddress}
          <span className="block">{whereText}</span>
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
      {edited}
    </div>
  )
}
