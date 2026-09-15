import { EllipsisVertical, PencilLine, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { lineChange } from '../lib/cart'
import type { CartChallan, CartLine, LineAllocation, LineChange } from '../types'
import { LineChangeBadge } from './delivery-badges'
import { QtyStepper } from './qty-stepper'

interface CartLineRowProps {
  challan: CartChallan
  line: CartLine
  canRemove: boolean
  onQty: (qty: number) => void
  onEdit: () => void
  onRemove: () => void
}

function detailFor(
  change: LineChange,
  line: CartLine,
  source: LineAllocation | undefined,
  reserved: number,
) {
  if (!source) {
    return undefined
  }
  switch (change) {
    case 'split':
      return `${line.qty} now · ${reserved} later`
    case 'reduced':
      return `challan ${source.ordered} → ${line.qty}`
    case 'increased':
      return `challan ${source.ordered} → ${line.qty}`
    case 'substituted':
      return `for ${source.model}`
    default:
      return undefined
  }
}

/**
 * One product line on the trip.
 *
 * The stepper is the everyday edit — trimming four to three because only three
 * were on the shelf — and the menu holds the rarer two: standing a different
 * model in for this one, and taking the line off the trip. The badge says what
 * the line now is relative to the paper, with the numbers behind the word.
 */
export function CartLineRow({ challan, line, canRemove, onQty, onEdit, onRemove }: CartLineRowProps) {
  const source = challan.sources.find((entry) => entry.index === line.sourceIndex)
  const change = lineChange(challan, line)
  const reserved = line.sourceIndex === null ? 0 : (challan.reserved[line.sourceIndex] ?? 0)
  const label = `${line.productName} ${line.model}`

  return (
    <li className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium wrap-break-word">{line.productName}</span>
          <LineChangeBadge change={change} detail={detailFor(change, line, source, reserved)} />
        </div>
        <p className="font-mono text-xs text-muted-foreground wrap-break-word">{line.model}</p>
        {source && source.dispatched > 0 && (
          <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
            {source.dispatched} of {source.ordered} already on other trips
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <QtyStepper value={line.qty} onChange={onQty} label={label} />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label={`More for ${label}`}>
                <EllipsisVertical aria-hidden />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={onEdit}>
              <PencilLine aria-hidden />
              {line.sourceIndex === null ? 'Edit product' : 'Change model or product'}
            </DropdownMenuItem>
            {/* A removal says the product does not exist, so it leaves the
                challan too. Sending it later is a split, not a removal. */}
            <DropdownMenuItem variant="destructive" disabled={!canRemove} onClick={onRemove}>
              <Trash2 aria-hidden />
              {line.sourceIndex === null ? 'Remove this product' : 'Remove from trip and challan'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}
