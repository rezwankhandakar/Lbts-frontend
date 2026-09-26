import { CircleAlert, Loader2, Route, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DateField } from '@/features/vendor/components/form-parts'
import { cartLines, challanQty } from '../lib/cart'
import { shortTripNumber } from '../lib/delivery-meta'
import type { TripWorkspace } from '../hooks/use-trip-workspace'
import { ChallanQuantitySummary } from './challan-quantity-summary'
import { SummaryFigures } from './summary-figures'
import { useT } from '@/lib/i18n'

interface DeliverySummaryPanelProps {
  workspace: TripWorkspace
  onConfirm: () => void
}

/**
 * The trip at a glance, and the one button that makes it real.
 *
 * Sticky beside the cart on a wide screen, so the totals move as quantities
 * change and Confirm is never a scroll away. It says what is still missing
 * rather than greying the button out in silence — a disabled button with no
 * reason is the least helpful control there is.
 */
export function DeliverySummaryPanel({ workspace, onConfirm }: DeliverySummaryPanelProps) {
  const t = useT()

  const { vehicle, driver, cart, blockers, editing, isSaving } = workspace

  return (
    <section
      aria-label={t('delivery.summary.panelAria')}
      className="overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <header className="flex items-center gap-2.5 border-b bg-gradient-to-r from-primary/10 to-transparent px-4 py-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Route className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">
            {editing ? shortTripNumber(editing.tripNumber) : t('delivery.summary.heading')}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {vehicle
              ? `${vehicle.vehicle.registrationNo} · ${vehicle.vendor.name}`
              : t('delivery.summary.noVehicle')}
          </p>
        </div>
      </header>

      <div className="space-y-4 p-4">
        <ChallanQuantitySummary lines={cartLines(cart.state)} />

        <SummaryFigures summary={cart.summary} />

        {driver && (
          <p className="text-xs text-muted-foreground">
            {t('delivery.driverWith', { name: driver.name })}
            {vehicle?.currentDriver && vehicle.currentDriver.id !== driver.id && (
              <span className="text-tone-indigo"> · for this trip only</span>
            )}
          </p>
        )}

        {cart.state.challans.length > 0 && (
          <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border bg-muted/20 p-2 text-xs">
            {cart.state.challans.map((challan) => (
              <li key={challan.challanId} className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate">
                  <span className="font-mono font-medium">{challan.challanNumber}</span>
                  <span className="text-muted-foreground"> · {challan.customerName}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums">{challanQty(challan)}</span>
              </li>
            ))}
          </ul>
        )}

        <DateField
          id="trip-date"
          label={t('delivery.summary.tripDate')}
          value={workspace.tripDate}
          onChange={workspace.setTripDate}
          disabled={isSaving}
        />

        <div className="space-y-1.5">
          <Label htmlFor="trip-note">
            {t('delivery.summary.tripNote')}{' '}
            <span className="text-muted-foreground">{t('common.labels.optionalSuffix')}</span>
          </Label>
          <Textarea
            id="trip-note"
            rows={2}
            maxLength={600}
            value={workspace.note}
            disabled={isSaving}
            onChange={(event) => workspace.setNote(event.target.value)}
          />
        </div>

        {blockers.length > 0 && (
          <ul className="space-y-1 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
            {blockers.map((reason) => (
              <li key={reason} className="flex items-start gap-1.5">
                <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
                {reason}
              </li>
            ))}
          </ul>
        )}

        <Button
          type="button"
          size="lg"
          className="h-11 w-full text-sm"
          disabled={blockers.length > 0 || isSaving}
          onClick={onConfirm}
        >
          {isSaving ? (
            <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
          ) : (
            <Send data-icon="inline-start" aria-hidden />
          )}
          {editing ? t('delivery.summary.save') : t('delivery.summary.create')}
        </Button>

        {!editing && vehicle && (
          <p className="text-center text-[11px] text-muted-foreground">
            {t('delivery.summary.numberedOn')}{' '}
            <span className="font-mono">{vehicle.vendor.vendorCode}-TRIP-…</span>
          </p>
        )}
      </div>
    </section>
  )
}
