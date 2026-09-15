import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useBillUnits } from '../hooks/use-bills'
import { useCreateBill, useUpdateBill } from '../hooks/use-bill-mutations'
import type { BillRecord } from '../types'
import { BillPeriodPicker } from './bill-period-picker'
import { SameSlotNotice } from './same-slot-notice'

interface BillFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present to correct a bill; absent to open a new slot. */
  bill?: BillRecord | null
}

/**
 * Opening a bill slot — a billing month and a unit — or correcting one. The
 * form mounts only while the dialog is open, so every opening starts clean.
 */
export function BillFormDialog({ open, onOpenChange, bill = null }: BillFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && <BillForm bill={bill} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

const HAS_UNIT = /[A-Z0-9]/

function BillForm({ bill, onDone }: { bill: BillRecord | null; onDone: () => void }) {
  const navigate = useNavigate()
  const now = new Date()
  const [month, setMonth] = useState(bill?.month ?? now.getMonth() + 1)
  const [year, setYear] = useState(bill?.year ?? now.getFullYear())
  const [unit, setUnit] = useState(bill?.unit ?? '')
  const [note, setNote] = useState(bill?.note ?? '')
  const [touched, setTouched] = useState(false)

  const units = useBillUnits(true)
  const create = useCreateBill()
  const update = useUpdateBill()
  const isPending = create.isPending || update.isPending

  const unitValue = unit.trim().toUpperCase()
  const unitLocked = Boolean(bill && bill.lineCount > 0)
  const unitError = touched && !HAS_UNIT.test(unitValue) ? 'Enter the unit this bill is for.' : null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (!HAS_UNIT.test(unitValue)) {
      return
    }
    const input = { month, year, unit: unitValue, note: note.trim() }
    if (bill) {
      update.mutate({ id: bill.id, input }, { onSuccess: onDone })
    } else {
      create.mutate(input, {
        onSuccess: (created) => {
          onDone()
          navigate(`/bills/${created.id}`)
        },
      })
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <DialogHeader>
        <DialogTitle>{bill ? `Edit ${bill.billNumber}` : 'Open a bill slot'}</DialogTitle>
        <DialogDescription>
          {bill
            ? 'Correct the billing month, the unit or the note. The bill number stays.'
            : 'Choose the billing month and the unit, then add its Trip DOs — the Excel bill builds itself as you go.'}
        </DialogDescription>
      </DialogHeader>

      <BillPeriodPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />

      <div className="grid gap-1.5">
        <Label htmlFor="bill-unit">Unit</Label>
        <Input
          id="bill-unit"
          value={unit}
          list="bill-unit-options"
          autoComplete="off"
          maxLength={24}
          disabled={unitLocked}
          aria-invalid={Boolean(unitError)}
          aria-describedby="bill-unit-hint"
          onChange={(event) => setUnit(event.target.value)}
          onBlur={() => setTouched(true)}
          className="font-mono uppercase"
        />
        <datalist id="bill-unit-options">
          {units.data?.map((option) => <option key={option} value={option} />)}
        </datalist>
        {!unitLocked && units.data && units.data.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label="Units on record">
            {units.data.slice(0, 10).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setUnit(option)}
                aria-pressed={option === unitValue}
                className={cn(
                  'rounded-md border px-2 py-0.5 font-mono text-[11.5px] font-medium transition',
                  option === unitValue
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        <p id="bill-unit-hint" className={cn('text-xs', unitError ? 'text-destructive' : 'text-muted-foreground')}>
          {unitError ??
            (unitLocked
              ? 'The unit is fixed while the bill carries rows.'
              : 'Only Trip DOs whose gate pass carries this unit can be added.')}
        </p>
      </div>

      {!bill && HAS_UNIT.test(unitValue) && <SameSlotNotice month={month} year={year} unit={unitValue} />}

      <div className="grid gap-1.5">
        <Label htmlFor="bill-note">
          Note <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="bill-note"
          rows={2}
          maxLength={400}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />}
          {bill ? 'Save changes' : 'Open bill'}
        </Button>
      </DialogFooter>
    </form>
  )
}
