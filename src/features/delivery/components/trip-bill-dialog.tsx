import { useState } from 'react'
import { Loader2, ReceiptText, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AmountWordsInput } from '@/components/shared/amount-words-input'
import { useFormatters, useT } from '@/lib/i18n'
import { takaInBanglaWords } from '@/lib/taka-words'
import { useSaveTripBill } from '../hooks/use-deliveries'
import { MAX_TRIP_CHARGE } from '../types'
import type { TripRecord } from '../types'

interface TripBillDialogProps {
  trip: TripRecord
  open: boolean
  onOpenChange: (open: boolean) => void
  /** After the bill is saved and the dialog closed — the trip page goes back to the backlog. */
  onSaved?: () => void
}

/**
 * What the trip cost: the lorry's rent and the labour bill, entered together.
 *
 * Opened from the bill tile at the head of the trip, and only for a viewer who
 * may change the trip — a reader already sees both figures, in taka and in
 * words, on the tile itself. Open whatever the trip's status, because the bill
 * for a run is usually the last thing to arrive, after every receiver has
 * signed.
 *
 * Every amount reads back in Bangla words, and so does the total, so a slipped
 * zero is caught before it is saved rather than on the vendor's invoice.
 */
export function TripBillDialog({ trip, open, onOpenChange, onSaved }: TripBillDialogProps) {
  const t = useT()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-tone-amber/10 text-tone-amber ring-1 ring-tone-amber/20">
              <ReceiptText className="size-4" aria-hidden />
            </span>
            <div>
              <DialogTitle>{t('delivery.bill.heading')}</DialogTitle>
              <DialogDescription className="mt-1 text-xs">{t('delivery.bill.subheading')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/*
         * The form is its own component so its draft is born when the dialog
         * opens and dies when it closes: reopening after a cancel starts from
         * what is saved, never from what was half-typed and abandoned.
         */}
        <BillForm
          trip={trip}
          onSaved={() => {
            onOpenChange(false)
            onSaved?.()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function BillForm({ trip, onSaved }: { trip: TripRecord; onSaved: () => void }) {
  const t = useT()
  const format = useFormatters()

  const [rent, setRent] = useState<number | null>(trip.tripRent)
  const [labour, setLabour] = useState<number | null>(trip.labourBill)
  const save = useSaveTripBill()

  const dirty = rent !== trip.tripRent || labour !== trip.labourBill
  const total = (rent ?? 0) + (labour ?? 0)
  const anything = rent !== null || labour !== null

  return (
    <>
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

      {anything && (
        <div className="rounded-xl border border-tone-indigo/25 bg-tone-indigo/5 px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">{t('delivery.bill.total')}</span>
            <span className="text-lg font-bold text-tone-indigo tabular-nums">{format.taka(total)}</span>
          </div>
          <p className="text-xs text-tone-indigo">{takaInBanglaWords(total)}</p>
        </div>
      )}

      {trip.billUpdatedAt && (
        <p className="text-[11px] text-muted-foreground">
          {trip.billUpdatedBy
            ? t('delivery.trip.lastSavedBy', {
                name: trip.billUpdatedBy.name,
                when: format.dateTime(trip.billUpdatedAt),
              })
            : t('delivery.trip.lastSaved', { when: format.dateTime(trip.billUpdatedAt) })}
        </p>
      )}

      <DialogFooter showCloseButton>
        <Button
          type="button"
          disabled={!dirty || save.isPending}
          onClick={() =>
            save.mutate(
              { tripId: trip.id, payload: { tripRent: rent, labourBill: labour } },
              { onSuccess: onSaved },
            )
          }
        >
          {save.isPending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
          ) : (
            <Save data-icon="inline-start" aria-hidden />
          )}
          {t('delivery.bill.save')}
        </Button>
      </DialogFooter>
    </>
  )
}
