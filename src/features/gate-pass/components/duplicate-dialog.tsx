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
import { formatTripDate } from '../lib/gate-pass-meta'
import type { DuplicateCandidate } from '../types'
import { GatePassStatusBadge } from './gate-pass-status-badge'

interface DuplicateDialogProps {
  duplicates: DuplicateCandidate[]
  isSubmitting: boolean
  onDismiss: () => void
  /** Submit anyway — the operator has decided this is a different trip. */
  onContinue: () => void
}

const MATCH_REASONS: Record<DuplicateCandidate['matchedOn'], string> = {
  tripDo: 'Same Trip DO',
  trip: 'Same vehicle, model and date',
}

/**
 * A possible duplicate is a question, not an error.
 *
 * Nothing here is a rule the system enforces: the same vehicle legitimately
 * carries the same model twice in a day on a split delivery, and the same DO
 * can be re-issued. So the matching records are put in front of the person who
 * can tell, with enough of each one to decide, and both answers are offered
 * plainly. The gate pass is already saved as a draft either way — closing this
 * loses nothing.
 */
export function DuplicateDialog({
  duplicates,
  isSubmitting,
  onDismiss,
  onContinue,
}: DuplicateDialogProps) {
  return (
    <Dialog open={duplicates.length > 0} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CopyCheck className="size-4 text-tone-amber" aria-hidden />
            {duplicates.length === 1
              ? 'A similar gate pass already exists'
              : `${duplicates.length} similar gate passes already exist`}
          </DialogTitle>
          <DialogDescription>
            Check whether this is the same delivery before you submit. Your work is saved as a
            draft either way.
          </DialogDescription>
        </DialogHeader>

        <ul className="max-h-72 space-y-2 overflow-y-auto">
          {duplicates.map((candidate) => (
            <li key={candidate.id} className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {candidate.gatePassId}
                    <GatePassStatusBadge status={candidate.status} />
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {candidate.customerName} · {candidate.vehicleNo}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    DO {candidate.tripDo} · {formatTripDate(candidate.tripDate)} ·{' '}
                    {candidate.productName} ({candidate.model})
                    {candidate.moreItems > 0 ? ` +${candidate.moreItems} more` : ''}
                  </p>
                  <p className="mt-1.5 text-[11px] font-medium text-tone-amber">
                    {MATCH_REASONS[candidate.matchedOn]}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  render={
                    <Link to={`/gate-pass/${candidate.id}`} target="_blank" rel="noreferrer" />
                  }
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
            {isSubmitting ? 'Submitting…' : 'This is a different trip — submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
