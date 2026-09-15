import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { lineDetail } from '../lib/delivery-meta'
import { returnedTotal } from '../lib/completion-payload'
import type { ReturnQuantities } from '../lib/completion-payload'
import type { TripChallanRecord } from '../types'
import { ChallanDocumentButtons } from './challan-document-buttons'
import { ChallanPartyDetails } from './challan-party-details'
import { DeliveryOutcomeBadge, LineChangeBadge } from './delivery-badges'
import { DeliveryDetailChips } from './delivery-detail-chips'
import { QtyStepper } from './qty-stepper'

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
 * The challan on the delivery page, drawn the way the trip manifest draws it —
 * so the operator recognises the sheet they are holding — with what came back
 * written against each line instead of in a separate summary.
 */
export function CompletionChallanCard({
  challan,
  returns,
  editing,
  disabled,
  onReturnChange,
}: CompletionChallanCardProps) {
  const returned = returnedTotal(returns)

  return (
    <article className="rounded-xl border bg-card shadow-xs">
      <header className="flex items-start gap-3 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2">
            <Link
              to={`/challan/${challan.challanId}`}
              className="inline-flex items-center gap-1 font-mono text-sm font-bold hover:underline"
            >
              {challan.challanNumber}
              <ExternalLink className="size-3 text-muted-foreground" aria-hidden />
            </Link>
            <span className="text-[11px] text-muted-foreground tabular-nums">SL {challan.slNumber}</span>
          </div>
          <p className="mt-0.5 text-sm font-semibold wrap-break-word">{challan.customerName}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <DeliveryOutcomeBadge value={challan.outcome} method={challan.completionMethod} />
            <DeliveryDetailChips challan={challan} />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums">{challan.totalQty} pcs</p>
          {returned > 0 && (
            <p className="text-[11px] text-tone-rose tabular-nums">{returned} came back</p>
          )}
        </div>
      </header>

      <ChallanPartyDetails challan={challan} className="px-4 pt-3" />

      <ul className="mt-1 divide-y px-4 pb-1">
        {challan.lines.map((line, index) => {
          const back = returns[index] ?? 0

          return (
            <li key={index} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-medium">{line.productName}</span>
                  <LineChangeBadge change={line.change} detail={lineDetail(line)} />
                </div>
                <p className="font-mono text-xs text-muted-foreground">{line.model}</p>
              </div>

              {editing ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Came back</span>
                  <QtyStepper
                    value={back}
                    onChange={(qty) => onReturnChange(index, qty)}
                    label={`${line.productName} ${line.model} returned`}
                    min={0}
                    max={line.qty}
                    disabled={disabled}
                  />
                  <span className="text-xs text-muted-foreground tabular-nums">of {line.qty}</span>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-sm font-semibold tabular-nums">× {line.qty}</span>
                  {back > 0 && (
                    <p className="text-[11px] text-tone-rose tabular-nums">
                      {back === line.qty ? 'all came back' : `${back} came back · ${line.qty - back} delivered`}
                    </p>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-2 border-t px-4 py-2.5">
        <ChallanDocumentButtons challan={challan} />
      </div>
    </article>
  )
}
