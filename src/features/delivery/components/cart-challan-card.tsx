import { MapPin, Phone, Plus, RotateCcw, StickyNote, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  challanChanges,
  challanQty,
  editedFields,
  leftForLater,
  missingSources,
  overagesOf,
} from '../lib/cart'
import { PARTY_LABELS, whereOf } from '../lib/delivery-meta'
import type { CartChallan } from '../types'
import { CartChallanMenu } from './cart-challan-menu'
import { ChallanChangeNotice } from './challan-change-notice'
import { CartLineRow } from './cart-line-row'
import type { TripCart } from '../hooks/use-trip-cart'

export type CartCardDialog =
  | { kind: 'party'; challanId: string }
  | { kind: 'split'; challanId: string }
  | { kind: 'line'; challanId: string; key: string | null }

interface CartChallanCardProps {
  challan: CartChallan
  position: number
  cart: TripCart
  onOpenDialog: (dialog: CartCardDialog) => void
}

/**
 * One challan on the trip — the unit an operator reviews before confirming.
 *
 * Top to bottom in the order it is checked against the paper: which challan,
 * who and where, then the goods. Everything on it can be changed for this trip
 * — the delivery details, each quantity, a model, a line added or taken off —
 * and every change is marked, so the review before Confirm is a look down the
 * badges rather than a comparison with the PDF.
 */
export function CartChallanCard({ challan, position, cart, onOpenDialog }: CartChallanCardProps) {
  const edited = editedFields(challan)
  const missing = missingSources(challan)
  const later = leftForLater(challan)
  const overages = overagesOf(challan)
  const changes = challanChanges(challan)
  const { thana, district } = whereOf(challan)

  return (
    <article
      aria-label={`Challan ${challan.challanNumber}`}
      className={cn(
        'rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-sm',
        overages.length > 0 && 'border-tone-orange/40',
      )}
    >
      <header className="flex items-start gap-3 border-b px-4 py-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground tabular-nums">
          {position}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-sm font-bold tracking-tight">{challan.challanNumber}</span>
            <span className="text-[11px] text-muted-foreground tabular-nums">SL {challan.slNumber}</span>
            {edited.length > 0 && (
              <span
                className="rounded-full border border-tone-amber/25 bg-tone-amber/10 px-2 py-px text-[11px] font-semibold text-tone-amber"
                title={`Changed for this trip: ${edited.map((field) => PARTY_LABELS[field]).join(', ')}`}
              >
                Details edited
              </span>
            )}
            {later > 0 && (
              <span className="rounded-full border border-tone-cyan/25 bg-tone-cyan/10 px-2 py-px text-[11px] font-semibold text-tone-cyan">
                Split · {later} for later
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-semibold wrap-break-word">{challan.customerName}</p>
        </div>

        <CartChallanMenu challan={challan} cart={cart} onOpenDialog={onOpenDialog} />
      </header>

      <div className="space-y-1 px-4 pt-3 text-xs text-muted-foreground">
        <p className="flex items-start gap-1.5">
          <MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
          <span className="min-w-0 wrap-break-word">
            {challan.deliveryAddress}
            <span className="block">
              Thana: <span className="text-foreground">{thana}</span> · District:{' '}
              <span className="text-foreground">{district}</span>
            </span>
          </span>
        </p>
        <p className="flex items-center gap-1.5">
          <Phone className="size-3.5 shrink-0" aria-hidden />
          <span className="font-medium text-foreground tabular-nums">{challan.receiverMobile}</span>
        </p>
        {challan.note && (
          <p className="flex items-start gap-1.5">
            <StickyNote className="mt-px size-3.5 shrink-0" aria-hidden />
            <span className="italic">{challan.note}</span>
          </p>
        )}
      </div>

      <ul className="divide-y px-4">
        {challan.lines.map((line) => (
          <CartLineRow
            key={line.key}
            challan={challan}
            line={line}
            canRemove={challan.lines.length > 1}
            onQty={(qty) => cart.setQty(challan.challanId, line.key, qty)}
            onEdit={() => onOpenDialog({ kind: 'line', challanId: challan.challanId, key: line.key })}
            onRemove={() => cart.removeLine(challan.challanId, line.key)}
          />
        ))}
      </ul>

      {overages.length > 0 && (
        <p className="mx-4 mb-2 flex items-start gap-1.5 rounded-lg bg-tone-orange/10 px-2.5 py-1.5 text-[11px] text-tone-orange">
          <TriangleAlert className="mt-px size-3 shrink-0" aria-hidden />
          More than the challan orders on {overages.map((overage) => overage.model).join(', ')}. You
          will be asked to confirm.
        </p>
      )}

      <ChallanChangeNotice
        challanNumber={challan.challanNumber}
        changes={changes}
        className="mx-4 mb-2"
      />

      <footer className="flex flex-wrap items-center gap-2 border-t bg-muted/20 px-4 py-2.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onOpenDialog({ kind: 'line', challanId: challan.challanId, key: null })}
        >
          <Plus data-icon="inline-start" aria-hidden />
          Add product
        </Button>
        {missing.map((source) => (
          <Button
            key={source.index}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => cart.restore(challan.challanId, source.index)}
          >
            <RotateCcw data-icon="inline-start" aria-hidden />
            Add back {source.productName}
          </Button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          <span className="font-semibold text-foreground">{challanQty(challan)}</span> pcs on this
          trip
        </span>
      </footer>
    </article>
  )
}
