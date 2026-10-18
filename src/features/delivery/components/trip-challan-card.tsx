import { ArrowRight, PackageCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { storedReturns } from '../lib/completion-payload'
import { completionMeta } from '../lib/delivery-meta'
import type { TripChallanRecord } from '../types'
import { ChallanCardExtras, ChallanCardHeader, ChallanCardLine, ChallanCardReserved } from './challan-card-parts'
import { ChallanDocumentButtons } from './challan-document-buttons'
import { ChallanPartyDetails } from './challan-party-details'

interface TripChallanCardProps {
  challan: TripChallanRecord
  /** Its place on the trip — the order the challans were put on the lorry. */
  position: number
  /** Where this challan's delivery page lives, when the viewer may open it. */
  completionHref?: string
}

/**
 * One challan on the lorry: which it is, who takes it and where, every product
 * line and what the trip did to it, how the delivery was finished, and the way
 * through to finishing it.
 *
 * **Sized so a laptop screen holds two rows of cards.** That is the budget
 * every line here is spent against: the header is two lines — the identifiers
 * and status, then the customer — the thana, district and receiver share one
 * line under the address, a product is one line with its model beside its
 * name, and the actions are the small buttons. Text stays at body size; it is
 * the padding and the stacking that were cut, not the legibility.
 *
 * The header is drawn in the delivery's own colour — a band token, because it
 * carries white text in both themes — so the ones still waiting for a signed
 * copy are found down a page without reading a word. Its parts are shared with
 * the delivery page (`challan-card-parts.tsx`), so a challan looks the same
 * where it is listed and where it is finished.
 */
export function TripChallanCard({ challan, position, completionHref }: TripChallanCardProps) {
  const t = useT()

  const meta = completionMeta(challan, t)
  const complete = challan.outcome === 'Complete'
  const returns = storedReturns(challan)

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
      <ChallanCardHeader challan={challan} returned={challan.returnedQty} position={position} />

      <ChallanPartyDetails challan={challan} className="px-3.5 pt-2.5" />
      <ChallanCardReserved challan={challan} />

      <ul aria-label={t('delivery.hero.products')} className="mx-3.5 mt-2 divide-y border-y">
        {challan.lines.map((line, index) => (
          <ChallanCardLine key={index} line={line} back={returns[index] ?? 0} />
        ))}
      </ul>

      <ChallanCardExtras challan={challan} />

      <footer className="mt-auto flex flex-wrap items-center gap-1.5 border-t bg-muted/30 px-3.5 py-2">
        <ChallanDocumentButtons challan={challan} />
        {completionHref && (
          <Button
            size="sm"
            className={cn('w-full text-primary-foreground sm:ms-auto sm:w-auto', meta.bandButton)}
            render={<Link to={completionHref} />}
          >
            <PackageCheck data-icon="inline-start" aria-hidden />
            {complete ? t('delivery.completion.openDelivery') : t('delivery.completion.completeDelivery')}
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Button>
        )}
      </footer>
    </article>
  )
}
