import { MapPin, Phone, StickyNote } from 'lucide-react'
import { SentenceWith } from '@/components/shared/sentence-with'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { PARTY_LABEL_KEYS, whereOf } from '../lib/delivery-meta'
import type { TripChallanRecord } from '../types'

/**
 * Where a challan on a trip is going and who takes it: the address with its
 * thana and district, the receiver's number, the trip's note, and which of
 * those the trip changed from the paper.
 *
 * Shared by the challan card on the trip page and on the delivery page, so the
 * two can never disagree about what a delivery's address block says. Laid out
 * for a card a laptop screen holds two rows of: the address in body text
 * clamped to two lines, and the thana, district and receiver's number sharing
 * the line beneath it at the same size, the place names in bold so they are
 * read rather than skimmed. There was a quieter stack of small grey lines for
 * the delivery page; that page draws the same card now, and the second layout
 * went with it.
 */
export function ChallanPartyDetails({ challan, className }: { challan: TripChallanRecord; className?: string }) {
  const t = useT()

  const where = whereOf(challan)

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

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-start gap-2">
        <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[13px] leading-snug wrap-break-word" title={challan.deliveryAddress}>
            {challan.deliveryAddress}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-muted-foreground">
            <span>
              <SentenceWith
                text={t('delivery.cart.where')}
                parts={{
                  thana: <span className="font-semibold text-foreground">{where.thana}</span>,
                  district: <span className="font-semibold text-foreground">{where.district}</span>,
                }}
              />
            </span>
            {challan.receiverMobile && (
              <a
                href={`tel:${challan.receiverMobile}`}
                className="inline-flex items-center gap-1 font-semibold text-foreground tabular-nums hover:underline"
              >
                <Phone className="size-3.5 text-primary" aria-hidden />
                {challan.receiverMobile}
              </a>
            )}
          </p>
        </div>
      </div>
      {challan.note && <NoteLine text={challan.note} />}
      {edited}
    </div>
  )
}

/**
 * A note somebody wrote about a delivery, as the trip page's challan card draws
 * it: a bold label and the words at body size, in plain type.
 *
 * It was small grey italics, which read as a footnote and were hard work for
 * exactly the sentence an operator most needs to see — "Bill hobe na" is an
 * instruction, not an aside. The label is the dictionary's, so the line still
 * says what it is when the note is one word long.
 */
export function NoteLine({ text, className }: { text: string; className?: string }) {
  const t = useT()

  return (
    <p
      className={cn('flex min-w-0 items-start gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-[13px] leading-snug', className)}
      title={text}
    >
      <StickyNote className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="line-clamp-2 min-w-0 wrap-break-word">
        <span className="font-semibold">{t('delivery.trip.note')}:</span> {text}
      </span>
    </p>
  )
}
