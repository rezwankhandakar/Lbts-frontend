import { useState } from 'react'
import { Loader2, ReceiptText, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSaveTripBill } from '../hooks/use-deliveries'
import { formatTakaBangla, takaInBanglaWords } from '@/lib/taka-words'
import { MAX_TRIP_CHARGE } from '../types'
import type { TripRecord } from '../types'
import { AmountWordsInput } from '@/components/shared/amount-words-input'
import { useT } from '@/lib/i18n'

interface TripBillCardProps {
  trip: TripRecord
  /** The author, or Admin and Manager — the rule `assertCanChangeTrip` enforces. */
  canChange: boolean
}

/**
 * What the trip cost: the lorry's rent and the labour bill.
 *
 * Editable whatever the trip's status, because the bill for a run is usually
 * the last thing to arrive — after every receiver has already signed. Every
 * amount reads back in Bangla words, and so does the total, so a slipped zero
 * is caught before it is saved rather than on the vendor's invoice.
 *
 * Mount keyed on the trip id: the draft amounts belong to one trip.
 */
export function TripBillCard({ trip, canChange }: TripBillCardProps) {
  const t = useT()

  const [rent, setRent] = useState<number | null>(trip.tripRent)
  const [labour, setLabour] = useState<number | null>(trip.labourBill)
  const save = useSaveTripBill()

  const dirty = rent !== trip.tripRent || labour !== trip.labourBill
  const total = (rent ?? 0) + (labour ?? 0)
  const anything = rent !== null || labour !== null

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-tone-amber/10 text-tone-amber ring-1 ring-tone-amber/20">
          <ReceiptText className="size-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{t('delivery.bill.heading')}</h2>
          <p className="text-xs text-muted-foreground">গাড়ি ভাড়া ও লেবার বিল</p>
        </div>
      </div>

      {canChange ? (
        <div className="space-y-3">
          <AmountWordsInput
            id="trip-rent"
            label={t('delivery.bill.tripRent')}
            value={rent}
            max={MAX_TRIP_CHARGE}
            disabled={save.isPending}
            onChange={setRent}
          />
          <AmountWordsInput
            id="labour-bill"
            label={t('delivery.bill.labourBill')}
            value={labour}
            max={MAX_TRIP_CHARGE}
            disabled={save.isPending}
            onChange={setLabour}
          />
        </div>
      ) : (
        <dl className="space-y-2 text-sm">
          {[
            { label: t('delivery.bill.tripRentShort'), value: trip.tripRent },
            { label: t('delivery.bill.labourBillShort'), value: trip.labourBill },
          ].map((row) => (
            <div key={row.label}>
              <dt className="text-xs text-muted-foreground">{row.label}</dt>
              <dd className="font-semibold">
                {row.value === null ? (
                  <span className="font-normal text-muted-foreground">{t('delivery.bill.notEntered')}</span>
                ) : (
                  <>
                    {formatTakaBangla(row.value)}{' '}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {takaInBanglaWords(row.value)}
                    </span>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {anything && (
        <div className="rounded-lg border border-tone-indigo/25 bg-tone-indigo/5 px-3 py-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Total (মোট)</span>
            <span className="text-lg font-bold text-tone-indigo tabular-nums">{formatTakaBangla(total)}</span>
          </div>
          <p className="text-xs text-tone-indigo">{takaInBanglaWords(total)}</p>
        </div>
      )}

      {canChange && (
        <Button
          type="button"
          className="w-full"
          disabled={!dirty || save.isPending}
          onClick={() => save.mutate({ tripId: trip.id, payload: { tripRent: rent, labourBill: labour } })}
        >
          {save.isPending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
          ) : (
            <Save data-icon="inline-start" aria-hidden />
          )}
          {t('delivery.bill.save')}
        </Button>
      )}

      {trip.billUpdatedAt && (
        <p className="text-[11px] text-muted-foreground">
          Last saved{trip.billUpdatedBy ? ` by ${trip.billUpdatedBy.name}` : ''} ·{' '}
          {new Date(trip.billUpdatedAt).toLocaleString()}
        </p>
      )}
    </section>
  )
}
