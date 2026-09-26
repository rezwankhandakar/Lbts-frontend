import { FileWarning, Undo2 } from 'lucide-react'
import { shortTripNumber } from '../lib/delivery-meta'
import type { DispatchCorrection, DispatchReturn } from '../types'
import { useT } from '@/lib/i18n'

/**
 * What came back, product by product and trip by trip.
 *
 * Kept apart from the corrections on purpose: a return is not a change to the
 * challan. It still orders these pieces, and they are waiting for another lorry.
 */
export function DispatchReturns({ returns }: { returns: DispatchReturn[] }) {
  const t = useT()

  return (
    <div className="border-t bg-tone-rose/5 px-4 py-3 sm:px-5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-tone-rose uppercase">
        <Undo2 className="size-3.5" aria-hidden />
        {t('delivery.dispatch.cameBack')}
      </p>
      <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
        {returns.map((entry, index) => (
          <li key={index}>
            <span className="font-mono text-foreground">{shortTripNumber(entry.tripNumber)}</span>{' '}
            brought back <span className="font-medium text-foreground">{entry.productName}</span>{' '}
            <span className="font-mono">{entry.model}</span>{' '}
            <span className="font-semibold text-tone-rose tabular-nums">× {entry.qty}</span>
            {entry.reason && <span className="italic"> — {entry.reason}</span>}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {t('delivery.dispatch.returnedStay')}
      </p>
    </div>
  )
}

/**
 * Why the challan says `Amended`.
 *
 * The record keeps only that it was amended and by whom; what each trip
 * actually changed is read off that trip's own line sources, which is the only
 * place the challan's previous quantity survives.
 */
export function DispatchCorrections({ corrections }: { corrections: DispatchCorrection[] }) {
  const t = useT()

  return (
    <div className="border-t bg-tone-orange/5 px-4 py-3 sm:px-5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-tone-orange uppercase">
        <FileWarning className="size-3.5" aria-hidden />
        {t('delivery.dispatch.correctedByDelivery')}
      </p>
      <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
        {corrections.map((correction, index) => (
          <li key={index}>
            <span className="font-mono text-foreground">
              {shortTripNumber(correction.tripNumber)}
            </span>{' '}
            {correction.replaced ? (
              <>
                sent <span className="font-medium text-foreground">{correction.model}</span> in place
                of <span className="font-mono">{correction.replaced}</span> ({correction.to})
              </>
            ) : correction.from === 0 ? (
              <>
                added <span className="font-medium text-foreground">{correction.productName}</span>{' '}
                <span className="font-mono">{correction.model}</span> ({correction.to})
              </>
            ) : (
              <>
                carried <span className="font-medium text-foreground">{correction.productName}</span>{' '}
                <span className="font-mono">{correction.model}</span> {correction.to} of{' '}
                {correction.from}
              </>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {t('delivery.dispatch.pdfShowsOriginal')}
      </p>
    </div>
  )
}
