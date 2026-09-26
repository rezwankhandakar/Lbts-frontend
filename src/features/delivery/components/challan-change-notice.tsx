import { FileWarning } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { changeSentence } from '../lib/delivery-meta'
import type { ChallanChange } from '../types'

interface ChallanChangeNoticeProps {
  challanNumber: string
  changes: ChallanChange[]
  className?: string
}

/**
 * What confirming this trip would do to the challan itself.
 *
 * Trimming a quantity, removing a line, replacing a model or adding a product
 * are all statements that the paper was wrong, so the challan is corrected to
 * match — permanently, and nothing cut can be picked up by a later trip. That
 * is a change to the corporate office's own record, so it is spelled out in
 * the cart, again in the confirmation, and never discovered afterwards.
 *
 * A split is deliberately absent from this list: it changes nothing on the
 * challan, which is the whole point of splitting rather than trimming.
 */
export function ChallanChangeNotice({
  challanNumber,
  changes,
  className,
}: ChallanChangeNoticeProps) {
  const t = useT()

  if (changes.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border border-tone-orange/25 bg-tone-orange/10 px-3 py-2 text-[11px] text-tone-orange',
        className,
      )}
    >
      <FileWarning className="mt-px size-3.5 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="font-semibold">
          {t('delivery.dispatch.confirmingUpdates', { challan: challanNumber })}
        </p>
        <ul className="mt-0.5 space-y-0.5">
          {changes.map((change) => (
            <li key={`${change.productName}|${change.model}|${change.kind}`}>
              {changeSentence(change, t)}
            </li>
          ))}
        </ul>
        <p className="mt-1 opacity-80">
          {t('delivery.dispatch.cannotBeAdded')}
        </p>
      </div>
    </div>
  )
}
