import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { CartSummary } from '../types'

interface Figure {
  label: string
  value: number
  tone?: string
}

/**
 * The cart's **exceptions**, and nothing else.
 *
 * There were three more figures here — challans, pieces and lines changed —
 * drawn at all times in large type at the top of every trip. They are gone, and
 * what stands in their place is `ChallanQuantitySummary`: "6 refrigerators, 2
 * air conditioners, 8 pieces" is a sentence somebody can check against a
 * tailgate, where "3 challans / 8 pieces / 5 lines changed" is three numbers
 * about paperwork that answer a question nobody at a gate is asking.
 *
 * What is left is only ever drawn when there is something to say. A split, a
 * challan this trip would rewrite, edited delivery details, a line going out
 * over the order — each of those is a thing to check before confirming, and a
 * row of zeros beside them is a row of things to read that say nothing.
 */
export function SummaryFigures({ summary, className }: { summary: CartSummary; className?: string }) {
  const t = useT()

  const figures: Figure[] = [
    { label: t('delivery.summary.split'), value: summary.splitChallans, tone: 'text-tone-cyan' },
    { label: t('delivery.summary.challansUpdated'), value: summary.correctedChallans, tone: 'text-tone-orange' },
    { label: t('delivery.summary.detailsEdited'), value: summary.editedChallans, tone: 'text-tone-amber' },
    { label: t('delivery.summary.linesChanged'), value: summary.changedLines, tone: 'text-tone-violet' },
    { label: t('delivery.summary.overTheOrder'), value: summary.overages.length, tone: 'text-tone-orange' },
  ].filter((figure) => figure.value > 0)

  if (figures.length === 0) {
    return null
  }

  return (
    <dl className={cn('grid grid-cols-2 gap-2', className)}>
      {figures.map((figure) => (
        <div key={figure.label} className="rounded-lg border bg-muted/20 px-3 py-2">
          <dt className="text-[11px] text-muted-foreground">{figure.label}</dt>
          <dd
            className={cn(
              'mt-0.5 text-xl leading-none font-semibold tracking-tight tabular-nums',
              figure.tone,
            )}
          >
            {figure.value.toLocaleString()}
          </dd>
        </div>
      ))}
    </dl>
  )
}
