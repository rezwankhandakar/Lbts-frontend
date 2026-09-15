import { ExternalLink, PackageCheck, Undo2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { lineDetail } from '../lib/delivery-meta'
import type { TripChallanRecord } from '../types'
import { ChallanDocumentButtons } from './challan-document-buttons'
import { ChallanPartyDetails } from './challan-party-details'
import { DeliveryOutcomeBadge, LineChangeBadge } from './delivery-badges'
import { DeliveryDetailChips } from './delivery-detail-chips'

interface TripManifestProps {
  challans: TripChallanRecord[]
  /** Where one challan's delivery page lives, when the viewer may open it. */
  completionHref?: (challan: TripChallanRecord) => string
}

/**
 * What went on the lorry, challan by challan.
 *
 * Every departure from the paper is marked where it happened — a trimmed
 * quantity, a replaced model, an added product, a corrected receiver — so the
 * manifest can be checked against the challans without holding the two side by
 * side.
 *
 * It is also where a delivery is finished. Each challan carries its own
 * outcome, what came back off the lorry, which floor it went up to and what
 * that cost, and a way through to the page that records all four — because a
 * trip does not end all at once: three challans on one lorry are three
 * deliveries, signed for at three doors.
 */
export function TripManifest({ challans, completionHref }: TripManifestProps) {
  return (
    <ol className="space-y-3">
      {challans.map((challan, index) => (
        <li key={challan.challanId} className="rounded-xl border bg-card shadow-xs">
          <header className="flex items-start gap-3 border-b px-4 py-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground tabular-nums">
              {index + 1}
            </span>
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
                {challan.returnedQty > 0 && challan.completionMethod !== 'Returned' && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-tone-rose/25 bg-tone-rose/10 px-1.5 py-0.5 text-[11px] text-tone-rose">
                    <Undo2 className="size-3" aria-hidden />
                    {challan.returnedQty} came back
                  </span>
                )}
                <DeliveryDetailChips challan={challan} />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span className="text-sm font-semibold tabular-nums">
                {challan.totalQty} pcs
              </span>
              {challan.returnedQty > 0 && (
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {challan.deliveredQty} delivered
                </span>
              )}
            </div>
          </header>

          <ChallanPartyDetails challan={challan} className="px-4 pt-3" />

          {challan.reserved.length > 0 && (
            <p className="mx-4 mt-2 rounded-md bg-tone-cyan/10 px-2 py-1 text-[11px] text-tone-cyan">
              Left on the challan for a later trip:{' '}
              {challan.reserved
                .map((line) => `${line.productName} ${line.model} × ${line.qty}`)
                .join('; ')}
            </p>
          )}

          <ul className="divide-y px-4 pb-1">
            {challan.lines.map((line, lineIndex) => (
              <li
                key={lineIndex}
                className={cn('flex items-center gap-3 py-2', line.change === 'added' && 'bg-tone-amber/3')}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-medium">{line.productName}</span>
                    <LineChangeBadge change={line.change} detail={lineDetail(line)} />
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">{line.model}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums">× {line.qty}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-2 border-t px-4 py-2.5">
            <ChallanDocumentButtons challan={challan} />
            {completionHref && (
              <Button
                variant={challan.outcome === 'Complete' ? 'ghost' : 'default'}
                size="sm"
                className="ms-auto"
                render={<Link to={completionHref(challan)} />}
              >
                <PackageCheck data-icon="inline-start" aria-hidden />
                {challan.outcome === 'Complete' ? 'Open the delivery' : 'Complete this delivery'}
              </Button>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
