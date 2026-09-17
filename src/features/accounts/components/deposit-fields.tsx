import { useReceivableFinalBills } from '../hooks/use-accounts'
import { taka } from '../lib/accounts-meta'
import { LockedValue } from './entry-field'
import type { KindFieldsProps } from './entry-kind-fields'

/**
 * Add money asks nothing about where the money came from: it is a deposit into
 * cash, and the amount, the day and the cash wallet are the whole entry.
 *
 * The one exception is a deposit recorded from a Walton final bill — "Record
 * payment received" on its card — which carries that bill, fixed, so the bill
 * knows how much of it has arrived. Nothing is drawn for a plain deposit.
 */
export function DepositFields({ draft, set, request }: KindFieldsProps) {
  const linked = Boolean(draft.finalBillId)
  const receivable = useReceivableFinalBills(linked)

  if (!linked) {
    return null
  }

  const bill = receivable.data?.find((option) => option.id === draft.finalBillId)
  const current = request.entry?.finalBill
  // A correction's own amount is already counted as received, so it is added back to what is left.
  const ownAmount = request.entry && current?.id === draft.finalBillId ? request.entry.amount : 0
  const left = bill ? bill.outstanding + ownAmount : null

  return (
    <div className="grid gap-1.5">
      <LockedValue
        label="Walton payment against final bill"
        value={bill ? `${bill.unit} · ${bill.periodLabel}` : (current?.label ?? 'Final bill')}
        detail={bill ? `Final bill ${taka(bill.finalAmount)} · ${taka(bill.receivedAmount)} received` : undefined}
      />
      {left !== null && left > 0 && (
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          {taka(left)} left to receive
          <button type="button" className="font-medium text-primary hover:underline" onClick={() => set({ amount: left })}>
            Fill it
          </button>
        </p>
      )}
    </div>
  )
}
