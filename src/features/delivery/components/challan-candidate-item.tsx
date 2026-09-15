import { Check, MapPin, Phone, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { shortTripNumber } from '../lib/delivery-meta'
import type { ChallanCandidate } from '../types'

interface ChallanCandidateItemProps {
  candidate: ChallanCandidate
  inCart: boolean
  active: boolean
  id: string
  onAdd: () => void
  onHover: () => void
}

/**
 * One challan offered by the cart search.
 *
 * What an operator needs to be sure it is the right sheet before adding it:
 * the number, who and where, what is on it — and, most of all, how much of it
 * has already gone out. A challan half-sent on another trip says so, with the
 * trip, because adding it again is the normal second half of a split and
 * adding one that is fully sent is almost always a mistake.
 */
export function ChallanCandidateItem({
  candidate,
  inCart,
  active,
  id,
  onAdd,
  onHover,
}: ChallanCandidateItemProps) {
  const full = candidate.lines.length > 0 && candidate.remaining === 0
  const partial = candidate.dispatched > 0 && !full
  const where = [candidate.thana, candidate.district].filter(Boolean).join(', ')

  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      onMouseMove={onHover}
      className={cn(
        'flex gap-3 rounded-lg border border-transparent p-3 transition-colors',
        active ? 'border-primary/30 bg-primary/5' : 'hover:bg-muted/50',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-mono text-sm font-semibold">{candidate.challanNumber}</span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            SL {candidate.slNumber}
          </span>
          {full && (
            <span className="rounded-full border border-tone-rose/25 bg-tone-rose/10 px-2 py-px text-[11px] font-semibold text-tone-rose">
              Sent in full
            </span>
          )}
          {partial && (
            <span className="rounded-full border border-tone-cyan/25 bg-tone-cyan/10 px-2 py-px text-[11px] font-semibold text-tone-cyan">
              {candidate.remaining} of {candidate.ordered} left
            </span>
          )}
        </div>

        <p className="mt-1 text-sm font-medium wrap-break-word">{candidate.customerName}</p>
        <p className="mt-0.5 flex items-start gap-1 text-xs text-muted-foreground">
          <MapPin className="mt-px size-3 shrink-0" aria-hidden />
          <span className="line-clamp-1">
            {candidate.deliveryAddress}
            {where && ` · ${where}`}
          </span>
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Phone className="size-3 shrink-0" aria-hidden />
          <span className="tabular-nums">{candidate.receiverMobile}</span>
        </p>

        <p className="mt-1.5 line-clamp-2 text-xs">
          {candidate.lines
            .map((line) => `${line.productName} ${line.model} × ${line.ordered}`)
            .join(' · ')}
        </p>

        {candidate.trips.length > 0 && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            On {candidate.trips.map((trip) => shortTripNumber(trip.tripNumber)).join(', ')}
          </p>
        )}
      </div>

      <Button
        type="button"
        size="sm"
        variant={inCart ? 'secondary' : full ? 'outline' : 'default'}
        disabled={inCart}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onAdd}
        className="self-start"
        aria-label={inCart ? `${candidate.challanNumber} is on this trip` : `Add ${candidate.challanNumber}`}
      >
        {inCart ? (
          <>
            <Check data-icon="inline-start" aria-hidden />
            Added
          </>
        ) : (
          <>
            <Plus data-icon="inline-start" aria-hidden />
            {full ? 'Add anyway' : 'Add'}
          </>
        )}
      </Button>
    </li>
  )
}
