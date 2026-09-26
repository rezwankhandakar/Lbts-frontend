import { FileSignature } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatTripDate } from '@/features/gate-pass/lib/gate-pass-meta'
import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { signedCopyGapOf } from '../types'
import { useLabourSignedCopies } from '../hooks/use-labour-bill-signed-copies'

interface SignedCopyButtonProps {
  challanId: string
  challanNumber: string
  className?: string
}

/**
 * One challan's receiver-signed copy, from the row that charges its handling.
 *
 * The bill is a list of deliveries somebody is being charged for, so "show me
 * the paper this one was signed for on" is the question asked at the row rather
 * than at the top of the page — and the copy opens where the amounts are, not
 * three clicks away in Delivery.
 *
 * Three states, and the middle one is why this is a component rather than a
 * link. A challan split across two lorries is **signed for twice**, so there is
 * no single copy to open: the button becomes a menu naming each trip. One copy
 * opens straight away, and none is a disabled button carrying the reason — the
 * signed copy is still out, it was declared lost, or everything came back and
 * nobody signed for anything. A blank would read as all three.
 */
export function SignedCopyButton({ challanId, challanNumber, className }: SignedCopyButtonProps) {
  const t = useT()

  const { byChallan, isLoading, view } = useLabourSignedCopies()
  const challan = byChallan.get(challanId)

  // Nothing is drawn until the read lands. A control that changes what it
  // means a second after the sheet appears is worse than one that arrives.
  if (isLoading || !challan) {
    return null
  }

  const label = t('labourBill.copies.rowAria', { challan: challanNumber })
  const styles = cn('text-muted-foreground hover:text-primary', className)

  if (challan.copies.length === 0) {
    return (
      <Button
        variant="ghost"
        size="icon-xs"
        disabled
        aria-label={t('labourBill.copies.rowNoneAria', { label })}
        title={signedCopyGapOf(challan, t)}
        className={cn(styles, 'opacity-40')}
      >
        <FileSignature aria-hidden />
      </Button>
    )
  }

  if (challan.copies.length === 1) {
    return (
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={label}
        title={t('labourBill.copies.rowOneTitle', {
          label,
          trip: challan.copies[0].tripNumber,
        })}
        className={styles}
        onClick={() => view(challan.copies[0], challanNumber)}
      >
        <FileSignature aria-hidden />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={t('labourBill.copies.rowTripsAria', {
              label,
              n: formatNumber(challan.copies.length),
            })}
            title={t('labourBill.copies.rowTripsTitle', {
              n: formatNumber(challan.copies.length),
            })}
            className={styles}
          />
        }
      >
        <FileSignature aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {t('labourBill.copies.wentOutOn', {
            challan: challanNumber,
            n: formatNumber(challan.copies.length),
          })}
        </DropdownMenuLabel>
        {challan.copies.map((copy) => (
          <DropdownMenuItem key={copy.tripId} onClick={() => view(copy, challanNumber)}>
            <FileSignature aria-hidden />
            <span className="font-mono text-xs">{copy.tripNumber}</span>
            <span className="ml-auto text-[11px] text-muted-foreground">
              {formatTripDate(copy.tripDate)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
