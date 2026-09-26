import { EllipsisVertical, ExternalLink, FilePenLine, Scissors, UserRoundPen, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TripCart } from '../hooks/use-trip-cart'
import type { CartChallan } from '../types'
import type { CartCardDialog } from './cart-challan-card'
import { useT } from '@/lib/i18n'

interface CartChallanMenuProps {
  challan: CartChallan
  cart: TripCart
  onOpenDialog: (dialog: CartCardDialog) => void
}

/**
 * What can be done to a whole challan on the trip.
 *
 * Two edits, and they are deliberately different things. **Delivery details**
 * corrects this trip's copy — the receiver, the address — and leaves the
 * challan alone. **Correct the filed challan** opens the Challan module's own
 * edit page, for when the paper record itself is wrong; that is a correction
 * with consequences (a regenerated barcode page, an `Amended` status), and it
 * belongs where those consequences are explained.
 */
export function CartChallanMenu({ challan, cart, onOpenDialog }: CartChallanMenuProps) {
  const t = useT()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={t('delivery.cart.actionsAria', { challan: challan.challanNumber })}>
            <EllipsisVertical aria-hidden />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem onClick={() => onOpenDialog({ kind: 'party', challanId: challan.challanId })}>
          <UserRoundPen aria-hidden />
          {t('delivery.cart.editDetails')}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={challan.sources.length === 0}
          onClick={() => onOpenDialog({ kind: 'split', challanId: challan.challanId })}
        >
          <Scissors aria-hidden />
          {t('delivery.cart.splitAcross')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => window.open(`/challan/${challan.challanId}`, '_blank', 'noopener')}
        >
          <ExternalLink aria-hidden />
          {t('delivery.cart.openChallan')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open(`/challan/${challan.challanId}/edit`, '_blank', 'noopener')}
        >
          <FilePenLine aria-hidden />
          {t('delivery.cart.correctChallan')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => cart.remove(challan.challanId)}>
          <X aria-hidden />
          {t('delivery.cart.removeFromTrip')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
