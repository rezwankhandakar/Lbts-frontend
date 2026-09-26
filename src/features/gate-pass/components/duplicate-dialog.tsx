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
import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'

interface DuplicateDialogProps {
  duplicates: DuplicateCandidate[]
  isSubmitting: boolean
  onDismiss: () => void
  /** Submit anyway — the operator has decided this is a different trip. */
  onContinue: () => void
}

const MATCH_REASON_KEYS: Record<DuplicateCandidate['matchedOn'], TranslationKey> = {
  tripDo: 'gatePass.duplicate.matchedTripDo',
}

/**
 * A possible duplicate is a question, not an error.
 *
 * It is asked only when another gate pass carries the same Trip DO. The same
 * vehicle and model on one day is ordinary — a lorry takes one model out on
 * several Trip DOs — so it is not asked about. Nothing here is enforced: a DO
 * can be re-issued, so the matching records are put in front of the person who
 * can tell, and both answers are offered plainly. The gate pass is already
 * saved as a draft either way — closing this loses nothing.
 */
export function DuplicateDialog({
  duplicates,
  isSubmitting,
  onDismiss,
  onContinue,
}: DuplicateDialogProps) {
  const t = useT()

  return (
    <Dialog open={duplicates.length > 0} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CopyCheck className="size-4 text-tone-amber" aria-hidden />
            {duplicates.length === 1
              ? t('gatePass.duplicate.titleOne')
              : t('gatePass.duplicate.titleMany', { n: formatNumber(duplicates.length) })}
          </DialogTitle>
          <DialogDescription>
            {t('gatePass.duplicate.description')}
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
                    {candidate.moreItems > 0
                      ? ` ${t('gatePass.duplicate.moreItems', {
                          n: formatNumber(candidate.moreItems),
                        })}`
                      : ''}
                  </p>
                  <p className="mt-1.5 text-[11px] font-medium text-tone-amber">
                    {t(MATCH_REASON_KEYS[candidate.matchedOn])}
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
                  {t('gatePass.duplicate.view')}
                  <ExternalLink data-icon="inline-end" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button variant="outline" onClick={onDismiss} disabled={isSubmitting}>
            {t('gatePass.duplicate.goBack')}
          </Button>
          <Button onClick={onContinue} disabled={isSubmitting}>
            {isSubmitting
              ? t('gatePass.duplicate.submitting')
              : t('gatePass.duplicate.submitAnyway')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
