import { Suspense, lazy, useState } from 'react'
import { Loader2, PackageOpen, ScanBarcode } from 'lucide-react'
import { toast } from 'sonner'
import { fetchChallanCandidates } from '../api/delivery-api'
import type { TripCart } from '../hooks/use-trip-cart'
import { lineChange } from '../lib/cart'

import type { CartChallan } from '../types'
import { CartChallanCard } from './cart-challan-card'
import type { CartCardDialog } from './cart-challan-card'
import { LineEditorDialog } from './line-editor-dialog'
import type { LineEditorMode } from './line-editor-dialog'
import { SplitChallanDialog } from './split-challan-dialog'
import { countOf, useT } from '@/lib/i18n'

/**
 * The challan entry form, the item rows and the rate-card type-ahead behind it
 * are a sizeable part of the Challan module, and most trips are loaded without
 * anybody correcting a challan — so an operator who never opens this pays
 * nothing for it.
 */
const CorrectChallanDialog = lazy(() =>
  import('./correct-challan-dialog').then((module) => ({
    default: module.CorrectChallanDialog,
  })),
)

/** What the line editor opens as: a new line, or an existing one with its source. */
function lineModeFor(challan: CartChallan, key: string | null): LineEditorMode | null {
  if (key === null) {
    return { kind: 'add' }
  }

  const line = challan.lines.find((entry) => entry.key === key)
  if (!line) {
    return null
  }

  const source = challan.sources.find((entry) => entry.index === line.sourceIndex)
  return {
    kind: 'edit',
    initial: { productName: line.productName, model: line.model, qty: line.qty },
    source:
      source && lineChange(challan, line) !== 'added'
        ? { productName: source.productName, model: source.model, ordered: source.ordered }
        : null,
  }
}

interface DeliveryCartProps {
  cart: TripCart
  /** Told whenever a dialog opens or closes, so the page can pause the scanner. */
  onDialogChange: (open: boolean) => void
  /**
   * The trip being edited, excluded from every allocation read so its own
   * quantities are not counted as gone out on another trip.
   */
  excludeTripId?: string
}

/**
 * The challans on this trip, and the two dialogs that edit one.
 *
 * The dialogs live here rather than on each card so there is only ever one of
 * each mounted, and so the page can be told when one is open — a barcode read
 * while somebody is typing a quantity must not add a challan behind the
 * dialog.
 */
export function DeliveryCart({ cart, onDialogChange, excludeTripId }: DeliveryCartProps) {
  const t = useT()

  const [dialog, setDialog] = useState<CartCardDialog | null>(null)

  const open = (next: CartCardDialog | null) => {
    setDialog(next)
    onDialogChange(next !== null)
  }

  /**
   * Takes a corrected challan again, from the challan as it now stands.
   *
   * `cart.refresh` is the wrong call here and the difference is the point:
   * that one re-reads how much is left to go and keeps what the operator put
   * on the trip, which is right when another trip took some of the challan and
   * wrong when the challan itself changed. A replaced model or a removed line
   * means the trip may be carrying rows the paper no longer lists, so the
   * challan is taken from scratch.
   *
   * A failure here leaves the card describing the challan as it was before the
   * correction, which is the one outcome nobody should confirm a trip on — so
   * it is said out loud rather than swallowed. The correction itself has
   * already succeeded and its own toast has already said so.
   */
  const retake = (challanId: string) => {
    void fetchChallanCandidates([challanId], excludeTripId)
      .then((candidates) => {
        const fresh = candidates.find((candidate) => candidate.id === challanId)
        if (fresh) {
          cart.retake(fresh)
          return
        }
        throw new Error('not returned')
      })
      .catch(() => {
        toast.warning(t('delivery.correct.staleTitle'), {
          description: t('delivery.correct.staleNote'),
        })
      })
  }

  const target = dialog
    ? cart.state.challans.find((challan) => challan.challanId === dialog.challanId) ?? null
    : null

  if (cart.state.challans.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <PackageOpen className="size-5" aria-hidden />
        </span>
        <p className="mt-3 text-sm font-semibold">{t('delivery.cart.empty')}</p>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
          {t('delivery.cart.emptyLong')}
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ScanBarcode className="size-3.5" aria-hidden />
          {t('delivery.cart.emptyHint')}
        </p>
      </div>
    )
  }

  const lineMode = dialog?.kind === 'line' && target ? lineModeFor(target, dialog.key) : null

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {countOf(cart.summary.challans, 'nouns.challan', t)} · {countOf(cart.summary.qty, 'nouns.piece', t)}
        {cart.summary.changedLines > 0 && ` · ${countOf(cart.summary.changedLines, 'nouns.line', t)} changed`}
      </p>

      {cart.state.challans.map((challan, index) => (
        <CartChallanCard
          key={challan.challanId}
          challan={challan}
          position={index + 1}
          cart={cart}
          onOpenDialog={open}
        />
      ))}

      {dialog?.kind === 'correct' && target && (
        <Suspense
          fallback={
            <div className="flex justify-center py-4 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" aria-hidden />
            </div>
          }
        >
          <CorrectChallanDialog
            key={target.challanId}
            challanId={target.challanId}
            challanNumber={target.challanNumber}
            onOpenChange={(next) => !next && open(null)}
            onCorrected={retake}
          />
        </Suspense>
      )}

      {dialog?.kind === 'split' && target && (
        <SplitChallanDialog
          key={target.challanId}
          challan={target}
          onOpenChange={(next) => !next && open(null)}
          onSplit={(take) => {
            cart.split(target.challanId, take)
            open(null)
          }}
        />
      )}

      {dialog?.kind === 'line' && target && lineMode && (
        <LineEditorDialog
          key={`${target.challanId}:${dialog.key ?? 'new'}`}
          mode={lineMode}
          challanNumber={target.challanNumber}
          onOpenChange={(next) => !next && open(null)}
          onSave={(values) => {
            if (dialog.key === null) {
              cart.addLine(target.challanId, values)
            } else {
              cart.editLine(target.challanId, dialog.key, values)
            }
            open(null)
          }}
        />
      )}
    </div>
  )
}
