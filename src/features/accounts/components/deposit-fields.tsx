import { useReceivableFinalBills, useReceivableLabourCsds } from '../hooks/use-accounts'
import { taka } from '../lib/accounts-meta'
import { LockedValue } from './entry-field'
import type { KindFieldsProps } from './entry-kind-fields'

/**
 * Add money asks nothing about where the money came from: it is a deposit into
 * cash, and the amount, the day and the cash wallet are the whole entry.
 *
 * The exception is a deposit recorded from a Walton bill — "Record payment
 * received" on a final bill's card, or on one CSD of a month's labour bill —
 * which carries that claim, fixed, so the claim knows how much of it has
 * arrived. Nothing is drawn for a plain deposit.
 */
export function DepositFields(props: KindFieldsProps) {
  if (props.draft.labourBillId) {
    return <LabourPaymentField {...props} />
  }
  if (props.draft.finalBillId) {
    return <FinalBillPaymentField {...props} />
  }
  return null
}

/** How much is left to receive, with the correction's own amount added back in. */
function FillIt({ left, onFill }: { left: number; onFill: () => void }) {
  if (left <= 0) {
    return null
  }
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
      {taka(left)} left to receive
      <button type="button" className="font-medium text-primary hover:underline" onClick={onFill}>
        Fill it
      </button>
    </p>
  )
}

function FinalBillPaymentField({ draft, set, request }: KindFieldsProps) {
  const receivable = useReceivableFinalBills(true)
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
      {left !== null && <FillIt left={left} onFill={() => set({ amount: left })} />}
    </div>
  )
}

/**
 * A payment against one CSD of a month's labour bill.
 *
 * The option is found by bill **and** CSD, because a labour bill has as many
 * claims as it has CSDs — an id alone would name the month and not the thing
 * being paid for.
 */
function LabourPaymentField({ draft, set, request }: KindFieldsProps) {
  const receivable = useReceivableLabourCsds(true)
  const option = receivable.data?.find(
    (candidate) => candidate.billId === draft.labourBillId && candidate.csd === draft.labourCsd,
  )
  const current = request.entry?.labourBill
  const isSame = current?.id === draft.labourBillId && current?.csd === draft.labourCsd
  const ownAmount = request.entry && isSame ? request.entry.amount : 0
  const left = option ? option.outstanding + ownAmount : null

  return (
    <div className="grid gap-1.5">
      <LockedValue
        label="Walton payment against labour bill"
        value={
          option
            ? `${option.csd} · ${option.periodLabel}`
            : (current?.label ?? (draft.labourCsd || 'Labour bill CSD'))
        }
        detail={
          option
            ? `${option.billNumber} · billed ${taka(option.billedAmount)} · ${taka(option.receivedAmount)} received`
            : undefined
        }
      />
      {left !== null && <FillIt left={left} onFill={() => set({ amount: left })} />}
    </div>
  )
}
