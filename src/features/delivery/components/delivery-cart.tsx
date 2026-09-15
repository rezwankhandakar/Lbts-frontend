import { useState } from 'react'
import { PackageOpen, ScanBarcode } from 'lucide-react'
import type { TripCart } from '../hooks/use-trip-cart'
import { lineChange } from '../lib/cart'
import { plural } from '../lib/delivery-meta'
import type { CartChallan } from '../types'
import { CartChallanCard } from './cart-challan-card'
import type { CartCardDialog } from './cart-challan-card'
import { ChallanPartyDialog } from './challan-party-dialog'
import { LineEditorDialog } from './line-editor-dialog'
import type { LineEditorMode } from './line-editor-dialog'
import { SplitChallanDialog } from './split-challan-dialog'

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
}

/**
 * The challans on this trip, and the three dialogs that edit one.
 *
 * The dialogs live here rather than on each card so there is only ever one of
 * each mounted, and so the page can be told when one is open — a barcode read
 * while somebody is typing a receiver's number must not add a challan behind
 * the dialog.
 */
export function DeliveryCart({ cart, onDialogChange }: DeliveryCartProps) {
  const [dialog, setDialog] = useState<CartCardDialog | null>(null)

  const open = (next: CartCardDialog | null) => {
    setDialog(next)
    onDialogChange(next !== null)
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
        <p className="mt-3 text-sm font-semibold">No challans on this trip yet</p>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
          Search above, or pick up the printed challans and scan their barcodes one after another —
          each one lands here with what is still to go.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ScanBarcode className="size-3.5" aria-hidden />
          No need to click anywhere first
        </p>
      </div>
    )
  }

  const lineMode = dialog?.kind === 'line' && target ? lineModeFor(target, dialog.key) : null

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {plural(cart.summary.challans, 'challan')} · {plural(cart.summary.qty, 'piece')}
        {cart.summary.changedLines > 0 && ` · ${plural(cart.summary.changedLines, 'line')} changed`}
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

      {dialog?.kind === 'party' && target && (
        <ChallanPartyDialog
          key={target.challanId}
          challan={target}
          onOpenChange={(next) => !next && open(null)}
          onSave={(party, note) => {
            cart.updateParty(target.challanId, party, note)
            open(null)
          }}
        />
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
