import { CopyCheck, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatRange } from '../lib/challan-meta'
import type { DuplicateChallanCandidate } from '../types'

interface DuplicateChallanDialogProps {
  duplicates: DuplicateChallanCandidate[]
  isSubmitting: boolean
  onDismiss: () => void
  /** File it anyway — the operator has decided this is a different delivery. */
  onContinue: () => void
}

/**
 * Both mean the same four values matched — customer, address, receiver number
 * and model — and differ only in where the match was found. The wording says
 * so out loud, because "same customer and model" was the old rule and it fired
 * on every branch of a customer taking one product to twenty of them.
 */
const MATCH_REASONS: Record<DuplicateChallanCandidate['matchedOn'], string> = {
  batch: 'Same customer, address, number and model — out of this same PDF',
  recent: 'Same customer, address, number and model in the last three months',
}

/**
 * A possible duplicate is a question, not an error.
 *
 * Nothing here is a rule the system enforces: a customer legitimately orders a
 * second identical unit, and a split delivery legitimately produces two
 * challans that look alike. So the matching records are put in front of the
 * person who can tell, with enough of each one to decide.
 *
 * Answering "file it anyway" resubmits the *same entry* — the idempotency key
 * was created with it, not with the click — so answering the question cannot
 * accidentally produce the very duplicate it was asking about. And nothing was
 * written when the question was raised: the challan is filed only once, on
 * whichever attempt the operator lets through.
 */
export function DuplicateChallanDialog({
  duplicates,
  isSubmitting,
  onDismiss,
  onContinue,
}: DuplicateChallanDialogProps) {
  return (
    <Dialog open={duplicates.length > 0} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CopyCheck className="size-4 text-tone-amber" aria-hidden />
            {duplicates.length === 1
              ? 'A similar challan has already been filed'
              : `${duplicates.length} similar challans have already been filed`}
          </DialogTitle>
          <DialogDescription>
            Check whether this is the same delivery before filing it. Nothing has been saved yet,
            and going back loses none of what you have typed.
          </DialogDescription>
        </DialogHeader>

        <ul className="max-h-72 space-y-2 overflow-y-auto">
          {duplicates.map((candidate) => (
            <li key={candidate.id} className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {candidate.challanNumber}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      SL {candidate.slNumber}
                    </span>
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {candidate.customerName} · {candidate.receiverMobile}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {candidate.product} ({candidate.model}) × {candidate.qty}
                    {candidate.moreItems > 0 ? ` +${candidate.moreItems} more` : ''}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {candidate.sourceFileName} ·{' '}
                    {formatRange({
                      startPage: candidate.sourcePageStart,
                      endPage: candidate.sourcePageEnd,
                    })}
                  </p>
                  <p className="mt-1.5 text-[11px] font-medium text-tone-amber">
                    {MATCH_REASONS[candidate.matchedOn]}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  render={<Link to={`/challan/${candidate.id}`} target="_blank" rel="noreferrer" />}
                >
                  View
                  <ExternalLink data-icon="inline-end" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button variant="outline" onClick={onDismiss} disabled={isSubmitting}>
            Go back and check
          </Button>
          <Button onClick={onContinue} disabled={isSubmitting}>
            {isSubmitting ? 'Filing…' : 'Different delivery — file it'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
