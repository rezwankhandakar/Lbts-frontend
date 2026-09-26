import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useVendorBills } from '../hooks/use-accounts'
import { taka } from '../lib/accounts-meta'
import { MONTH_NAMES } from '../types'
import { EntryField, LockedValue } from './entry-field'
import type { KindFieldsProps } from './entry-kind-fields'
import { formatPeriod } from '@/lib/format'
import { useT } from '@/lib/i18n'

/**
 * The vendor and the month a payment settles. The vendors offered are the
 * ones with something due that month, with the figure beside them — after
 * every trip advance — so the amount is read off rather than worked out.
 */
export function VendorPaymentFields({ draft, set, errors, request }: KindFieldsProps) {
  const t = useT()

  const period = { year: draft.year, month: draft.month }
  const bills = useVendorBills(period)
  const rows = bills.data?.rows ?? []
  const selected = rows.find((row) => row.vendor.id === draft.vendorId)
  const ownAmount =
    request.entry && request.entry.vendor?.id === draft.vendorId && request.entry.period?.year === draft.year && request.entry.period?.month === draft.month
      ? request.entry.amount
      : 0
  const due = selected ? Math.max(0, selected.due + ownAmount) : null
  const locked = request.locked?.includes('vendorId')

  const dueHint =
    selected && due !== null ? (
      <span className="flex flex-wrap items-center gap-x-2">
        {taka(due)} due after {taka(selected.advance)} in trip advances
        {due > 0 && (
          <button type="button" className="font-medium text-primary hover:underline" onClick={() => set({ amount: due })}>
            {t('accounts.vendorBill.payItAll')}
          </button>
        )}
        {selected.blankBills > 0 && (
          <span className="text-tone-amber">
            · {selected.blankBills} {selected.blankBills === 1 ? 'trip has' : 'trips have'} no bill yet
          </span>
        )}
      </span>
    ) : undefined

  if (locked && selected) {
    return (
      <div className="grid gap-1.5">
        <LockedValue
          label={t('accounts.vendorBill.paying')}
          value={t('accounts.vendorBill.payingValue', {
            vendor: selected.vendor.name,
            period: formatPeriod(draft.month, draft.year),
          })}
        />
        <div className="text-xs text-muted-foreground">{dueHint}</div>
      </div>
    )
  }

  const years = Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - 3 + index)
  const choosable = rows.filter((row) => row.due > 0 || row.vendor.id === draft.vendorId)

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
      <div className="grid grid-cols-[1fr_6rem] gap-2">
        <EntryField id="entry-month" label={t('accounts.vendorBill.billMonth')}>
          <Select value={String(draft.month)} onValueChange={(next) => set({ month: Number(next), vendorId: '' })}>
            <SelectTrigger id="entry-month" className="h-9 w-full">
              <SelectValue>{(value: string) => MONTH_NAMES[Number(value) - 1]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {MONTH_NAMES.map((name, index) => (
                  <SelectItem key={name} value={String(index + 1)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </EntryField>
        <EntryField id="entry-year" label={t('accounts.vendorBill.year')}>
          <Select value={String(draft.year)} onValueChange={(next) => set({ year: Number(next), vendorId: '' })}>
            <SelectTrigger id="entry-year" className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </EntryField>
      </div>

      <EntryField
        id="entry-vendor"
        label={t('accounts.vendorBill.vendor')}
        error={errors.vendorId}
        hint={dueHint}
      >
        <Select value={draft.vendorId || null} onValueChange={(next) => set({ vendorId: String(next ?? '') })}>
          <SelectTrigger id="entry-vendor" className="h-9 w-full" aria-invalid={Boolean(errors.vendorId)}>
            <SelectValue>
              {(value: string | null) =>
                rows.find((row) => row.vendor.id === value)?.vendor.name ??
                request.entry?.vendor?.name ?? (
                  <span className="text-muted-foreground">{bills.isPending ? t('common.states.loading') : t('accounts.vendorBill.chooseVendor')}</span>
                )
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {choosable.map((row) => (
                <SelectItem key={row.vendor.id} value={row.vendor.id}>
                  <span className="flex flex-1 items-center justify-between gap-4">
                    <span className="truncate">{row.vendor.name}</span>
                    <span className="text-xs tabular-nums">{taka(Math.max(0, row.due))} due</span>
                  </span>
                </SelectItem>
              ))}
              {choosable.length === 0 && !bills.isPending && (
                <div className="px-2 py-3 text-xs text-muted-foreground">{t('accounts.vendorBill.nothingDue')}</div>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </EntryField>
    </div>
  )
}
