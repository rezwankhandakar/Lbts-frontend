import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { plural } from '../lib/delivery-meta'
import type { TripWorkspace } from '../hooks/use-trip-workspace'

/**
 * Confirm, always within reach of a thumb.
 *
 * On a phone the summary panel sits under a cart that can run to a dozen
 * challans, so the totals and the button ride along the bottom edge instead.
 * Hidden on a wide screen, where the sticky panel does the same job.
 */
export function MobileConfirmBar({
  workspace,
  onConfirm,
}: {
  workspace: TripWorkspace
  onConfirm: () => void
}) {
  const { cart, blockers, isSaving, editing } = workspace

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 py-3 shadow-[0_-4px_16px_-8px_rgb(0_0_0/0.15)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tabular-nums">
            {plural(cart.summary.challans, 'challan')} · {plural(cart.summary.qty, 'pc', 'pcs')}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {blockers[0] ?? (workspace.vehicle?.vehicle.registrationNo || 'Ready to confirm')}
          </p>
        </div>
        <Button
          type="button"
          disabled={blockers.length > 0 || isSaving}
          onClick={onConfirm}
          className="h-10"
        >
          {isSaving ? (
            <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
          ) : (
            <Send data-icon="inline-start" aria-hidden />
          )}
          {editing ? 'Save' : 'Create'}
        </Button>
      </div>
    </div>
  )
}
