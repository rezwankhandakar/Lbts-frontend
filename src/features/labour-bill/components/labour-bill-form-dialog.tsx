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
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useCreateLabourBill, useUpdateLabourBill } from '../hooks/use-labour-bill-mutations'
import { useLabourBillCompanies } from '../hooks/use-labour-bills'
import type { LabourBillRecord } from '../types'
import { LabourBillPeriodPicker } from './labour-bill-period-picker'

interface LabourBillFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present to correct a slot; absent to open a new one. */
  bill?: LabourBillRecord | null
}

/**
 * Opening a labour bill slot, or correcting one. The form mounts only while the
 * dialog is open, so every opening starts clean.
 */
export function LabourBillFormDialog({ open, onOpenChange, bill = null }: LabourBillFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && <LabourBillForm bill={bill} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function LabourBillForm({ bill, onDone }: { bill: LabourBillRecord | null; onDone: () => void }) {
  const t = useT()

  const navigate = useNavigate()
  const now = new Date()
  const [month, setMonth] = useState(bill?.month ?? now.getMonth() + 1)
  const [year, setYear] = useState(bill?.year ?? now.getFullYear())
  const [company, setCompany] = useState(bill?.company ?? '')
  const [note, setNote] = useState(bill?.note ?? '')

  const companies = useLabourBillCompanies(true)
  const create = useCreateLabourBill()
  const update = useUpdateLabourBill()
  const isPending = create.isPending || update.isPending

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const input = { month, year, company: company.trim(), note: note.trim() }
    if (bill) {
      update.mutate({ id: bill.id, input }, { onSuccess: onDone })
    } else {
      create.mutate(input, {
        onSuccess: (created) => {
          onDone()
          navigate(`/labour-bills/${created.id}`)
        },
      })
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <DialogHeader>
        <DialogTitle>
          {bill
            ? t('labourBill.form.editTitle', { bill: bill.billNumber })
            : t('labourBill.form.openTitle')}
        </DialogTitle>
        <DialogDescription>
          {bill
            ? t('labourBill.form.editDescription')
            : t('labourBill.list.emptyHint')}
        </DialogDescription>
      </DialogHeader>

      <LabourBillPeriodPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />

      <div className="grid gap-1.5">
        <Label htmlFor="labour-company">
          {t('labourBill.form.company')}{' '}
          <span className="font-normal text-muted-foreground">
            {t('common.labels.optionalSuffix')}
          </span>
        </Label>
        <Input
          id="labour-company"
          value={company}
          list="labour-company-options"
          autoComplete="off"
          maxLength={60}
          aria-describedby="labour-company-hint"
          onChange={(event) => setCompany(event.target.value)}
        />
        <datalist id="labour-company-options">
          {companies.data?.map((option) => <option key={option} value={option} />)}
        </datalist>
        {companies.data && companies.data.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label={t('labourBill.toolbar.companiesAria')}>
            {companies.data.slice(0, 8).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCompany(option)}
                aria-pressed={option === company.trim()}
                className={cn(
                  'rounded-md border px-2 py-0.5 text-[11.5px] font-medium transition',
                  option === company.trim()
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        <p id="labour-company-hint" className="text-xs text-muted-foreground">
          {t('labourBill.form.companyHint')}
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="labour-note">
          {t('common.labels.note')}{' '}
          <span className="font-normal text-muted-foreground">
            {t('common.labels.optionalSuffix')}
          </span>
        </Label>
        <Textarea
          id="labour-note"
          rows={2}
          maxLength={400}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>
          {t('common.actions.cancel')}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />}
          {bill ? t('common.actions.saveChanges') : t('labourBill.form.openBill')}
        </Button>
      </DialogFooter>
    </form>
  )
}
