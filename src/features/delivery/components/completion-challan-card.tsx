import { returnedTotal } from '../lib/completion-payload'
import type { ReturnQuantities } from '../lib/completion-payload'
import type { TripChallanRecord } from '../types'
import { ChallanCardExtras, ChallanCardHeader, ChallanCardLine, ChallanCardReserved } from './challan-card-parts'
import { ChallanDocumentButtons } from './challan-document-buttons'
import { ChallanPartyDetails } from './challan-party-details'
import { QtyStepper } from './qty-stepper'
import { useT } from '@/lib/i18n'
import { formatNumber } from '@/lib/format'

interface CompletionChallanCardProps {
  challan: TripChallanRecord
  /** What came back per line — on record, or being edited. */
  returns: ReturnQuantities
  /** True while *Some came back* is open: each line gets a stepper. */
  editing: boolean
  disabled: boolean
  onReturnChange: (lineIndex: number, qty: number) => void
}

/**
 * The challan on the delivery page, drawn exactly as its card on the trip page
 * is — the same header in the delivery's colour, the same address block, the
 * same product rows — so the operator recognises the challan they just opened
 * from the trip. The pieces are shared (`challan-card-parts.tsx`) rather than
 * copied, which is what keeps the two from drifting.
 *
 * Two things differ, both because this is where the delivery is finished. The
 * header's figures follow the returns **being typed**, not only the saved
 * ones, so "1 came back · 2 delivered" moves with the stepper. And while *Some
 * came back* is open, the stepper stands where each line's quantity is. There
 * is no link through to the delivery — this is it — and no position number,
 * since the challan is on its own page.
 */
export function CompletionChallanCard({
  challan,
  returns,
  editing,
  disabled,
  onReturnChange,
}: CompletionChallanCardProps) {
  const t = useT()

  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <ChallanCardHeader challan={challan} returned={returnedTotal(returns)} />

      <ChallanPartyDetails challan={challan} className="px-3.5 pt-2.5" />
      <ChallanCardReserved challan={challan} />

      <ul aria-label={t('delivery.hero.products')} className="mx-3.5 mt-2 divide-y border-y">
        {challan.lines.map((line, index) => (
          <ChallanCardLine
            key={index}
            line={line}
            back={returns[index] ?? 0}
            aside={
              editing ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">{t('delivery.cameBack')}</span>
                  <QtyStepper
                    value={returns[index] ?? 0}
                    onChange={(qty) => onReturnChange(index, qty)}
                    label={t('delivery.completion.returnedLabel', {
                      product: line.productName,
                      model: line.model,
                    })}
                    min={0}
                    max={line.qty}
                    disabled={disabled}
                  />
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {t('delivery.completion.ofTotal', { total: formatNumber(line.qty) })}
                  </span>
                </div>
              ) : undefined
            }
          />
        ))}
      </ul>

      <ChallanCardExtras challan={challan} />

      <footer className="flex flex-wrap items-center gap-1.5 border-t bg-muted/30 px-3.5 py-2">
        <ChallanDocumentButtons challan={challan} />
      </footer>
    </article>
  )
}
