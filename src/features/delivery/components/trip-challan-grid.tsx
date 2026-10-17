import { FileStack } from 'lucide-react'
import { useFormatters, useT } from '@/lib/i18n'
import type { TripChallanRecord } from '../types'
import { TripChallanCard } from './trip-challan-card'

interface TripChallanGridProps {
  challans: TripChallanRecord[]
  /** Where one challan's delivery page lives, when the viewer may open it. */
  completionHref?: (challan: TripChallanRecord) => string
  /** The challan whose stop was just pressed, drawn ringed for a moment. */
  highlightedId?: string | null
}

/**
 * What went on the lorry, challan by challan — two to a row from `lg`, one
 * below it. Not from `md`: with the sidebar open, half of an `md` content
 * column is too narrow for a header carrying a customer name beside the count.
 *
 * It is also where a delivery is finished: each card carries its own outcome
 * and a way through to the page that records what came back, the floor, the
 * carrying and the signed copy — because a trip does not end all at once.
 * Three challans on one lorry are three deliveries, signed for at three doors.
 */
export function TripChallanGrid({ challans, completionHref, highlightedId = null }: TripChallanGridProps) {
  const t = useT()
  const format = useFormatters()

  return (
    <section aria-label={t('delivery.manifestAria')}>
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
          <FileStack className="size-4" aria-hidden />
        </span>
        <h2 className="text-base font-semibold tracking-tight">{t('delivery.hero.challans')}</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums">
          {format.number(challans.length)}
        </span>
        <p className="w-full text-xs text-muted-foreground sm:ms-auto sm:w-auto">{t('delivery.hero.challansHint')}</p>
      </div>

      <ol className="grid gap-3 lg:grid-cols-2">
        {challans.map((challan, index) => (
          <li key={challan.challanId} className="min-w-0">
            <TripChallanCard
              challan={challan}
              position={index + 1}
              completionHref={completionHref?.(challan)}
              highlighted={highlightedId === challan.challanId}
            />
          </li>
        ))}
      </ol>
    </section>
  )
}
