import { EllipsisVertical, ExternalLink, FilePenLine, Scissors, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { canWriteChallans } from '@/features/challan/types'
import { useCurrentRole } from '@/hooks/use-current-role'
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
 * The delivery details are deliberately not among them. A trip used to be able
 * to correct its own copy of the receiver and the address, and that is gone:
 * the challan is the record of where a delivery goes, so a wrong address is
 * wrong on the paper and is put right there. **Correct the filed challan**
 * is how: it opens the Challan module's own form in a dialog over the trip,
 * and saving rewrites the record itself — the barcode page is redrawn, the
 * stored PDF replaced, the challan marked `Amended`. The dialog explains all
 * of that before anything is saved. It is offered only to a role that may
 * write challans, absent rather than disabled, because a disabled item is a
 * promise of something that will never be allowed.
 */
export function CartChallanMenu({ challan, cart, onOpenDialog }: CartChallanMenuProps) {
  const t = useT()

  const canCorrect = canWriteChallans(useCurrentRole())

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
        {canCorrect && (
          <DropdownMenuItem
            onClick={() => onOpenDialog({ kind: 'correct', challanId: challan.challanId })}
          >
            <FilePenLine aria-hidden />
            {t('delivery.cart.correctChallan')}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => cart.remove(challan.challanId)}>
          <X aria-hidden />
          {t('delivery.cart.removeFromTrip')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
