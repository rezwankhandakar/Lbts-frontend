import { FileBadge, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { AmountWordsInput } from '@/components/shared/amount-words-input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BillPeriodPicker } from '@/features/bill/components/bill-period-picker'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useFinalBillSlot, useUnits } from '../hooks/use-accounts'
import { useSaveFinalBill } from '../hooks/use-accounts-mutations'
import { currentPeriod, taka } from '../lib/accounts-meta'
import { MAX_ACCOUNT_AMOUNT } from '../types'
import type { FinalBillRecord } from '../types'
import { EntryField } from './entry-field'
import { FinalBillSlotPanel } from './final-bill-slot-panel'
import { useT } from '@/lib/i18n'

interface FinalBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: FinalBillRecord | null
}

export function FinalBillDialog({ open, onOpenChange, bill }: FinalBillDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        {open && <FinalBillForm bill={bill} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

const HAS_UNIT = /[A-Za-z0-9]/

/**
 * Entering, or correcting, what Walton approved for a unit's month after the
 * audit. The one figure in the module that is income, typed by hand because
 * only the audit knows it.
 */
function FinalBillForm({ bill, onDone }: { bill: FinalBillRecord | null; onDone: () => void }) {
  const t = useT()

  const start = currentPeriod()
  const [month, setMonth] = useState(bill?.month ?? start.month)
  const [year, setYear] = useState(bill?.year ?? start.year)
  const [unit, setUnit] = useState(bill?.unit ?? '')
  const [finalAmount, setFinalAmount] = useState<number | null>(bill?.finalAmount ?? null)
  const [referenceNo, setReferenceNo] = useState(bill?.referenceNo ?? '')
  const [receivedOn, setReceivedOn] = useState(bill?.receivedOn ?? '')
  const [note, setNote] = useState(bill?.note ?? '')
  const [touched, setTouched] = useState(false)

  const units = useUnits()
  const save = useSaveFinalBill()
  const unitValue = unit.trim().toUpperCase()
  const debouncedUnit = useDebouncedValue(unitValue, 300)
  const slot = useFinalBillSlot({ year, month }, debouncedUnit, HAS_UNIT.test(debouncedUnit))

  const unitError = touched && !HAS_UNIT.test(unitValue) ? 'accounts.validation.unitRequired' : undefined
  const amountError =
    touched && finalAmount === null ? 'accounts.validation.finalAmountRequired' : undefined
  const belowReceived = bill && finalAmount !== null && finalAmount < bill.receivedAmount

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (!HAS_UNIT.test(unitValue) || finalAmount === null) return
    save.mutate(
      {
        id: bill?.id ?? null,
        input: { year, month, unit: unitValue, finalAmount, referenceNo: referenceNo.trim(), receivedOn: receivedOn || null, note: note.trim() },
      },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <DialogHeader className="flex-row items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-tone-emerald/10 text-tone-emerald ring-1 ring-tone-emerald/20">
          <FileBadge className="size-4" aria-hidden />
        </span>
        <div>
          <DialogTitle>
            {bill
              ? t('accounts.finalBill.editTitle', { unit: bill.unit, period: bill.periodLabel })
              : t('accounts.finalBill.enterTitle')}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {t('accounts.finalBill.description')}
          </DialogDescription>
        </div>
      </DialogHeader>

      <BillPeriodPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />

      <EntryField id="final-unit" label={t('accounts.finalBill.unit')} error={unitError}>
        <Input id="final-unit" value={unit} list="final-unit-options" maxLength={24} autoComplete="off" className="font-mono uppercase" aria-invalid={Boolean(unitError)} onChange={(event) => setUnit(event.target.value)} />
        <datalist id="final-unit-options">{units.data?.map((option) => <option key={option} value={option} />)}</datalist>
      </EntryField>

      <FinalBillSlotPanel slot={HAS_UNIT.test(debouncedUnit) ? slot.data : undefined} isFetching={slot.isFetching} finalAmount={finalAmount} editingId={bill?.id ?? null} />

      <AmountWordsInput
        id="final-amount"
        label={t('accounts.finalBill.amount')}
        value={finalAmount}
        max={MAX_ACCOUNT_AMOUNT}
        error={amountError ?? (belowReceived ? `${taka(bill.receivedAmount)} is already received against this bill.` : null)}
        onChange={setFinalAmount}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <EntryField id="final-ref" label={t('accounts.finalBill.reference')} optional>
          <Input id="final-ref" value={referenceNo} maxLength={80} autoComplete="off" onChange={(event) => setReferenceNo(event.target.value)} />
        </EntryField>
        <EntryField id="final-received-on" label={t('accounts.finalBill.receivedOn')} optional>
          <Input id="final-received-on" type="date" value={receivedOn} onChange={(event) => setReceivedOn(event.target.value)} />
        </EntryField>
      </div>

      <EntryField
        id="final-note"
        label={t('accounts.finalBill.auditNote')}
        optional
        hint={t('accounts.finalBill.auditNoteHint')}
      >
        <Textarea id="final-note" rows={2} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} />
      </EntryField>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending || Boolean(belowReceived)}>
          {save.isPending && <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />}
          {bill ? t('common.actions.saveChanges') : t('accounts.finalBill.save')}
        </Button>
      </DialogFooter>
    </form>
  )
}
