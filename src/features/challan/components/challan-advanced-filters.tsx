import { Button } from '@/components/ui/button'
import { BillingFilterSelect } from '@/features/bill/components/billing-filter-select'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  ChallanAmountFilter,
  ChallanDispatchFilter,
  ChallanFilterPatch,
  ChallanListParams,
} from '../types'

/**
 * The filter vocabularies as keys rather than words.
 *
 * A table of labels built at module scope is frozen in whichever language the
 * tab was opened in; a table of keys is read through the translator on every
 * render, so a language switch moves the select with everything else.
 */
const DISPATCH_KEYS: Record<ChallanDispatchFilter, TranslationKey> = {
  all: 'challan.filters.anyDispatch',
  pending: 'challan.filters.notDispatched',
  partial: 'challan.filters.partlySent',
  sent: 'challan.filters.sent',
  delivered: 'challan.filters.delivered',
  returned: 'challan.filters.returnedAtDepot',
}

const AMOUNT_KEYS: Record<ChallanAmountFilter, TranslationKey> = {
  all: 'challan.filters.anyAmount',
  unpriced: 'challan.filters.blankAmount',
  partial: 'challan.filters.partlyCharged',
}

interface ChallanAdvancedFiltersProps {
  params: ChallanListParams
  onChange: (patch: ChallanFilterPatch) => void
  canFilterByOwner: boolean
  currentUserId: string | null
}

/** Everything behind "More filters". */
export function ChallanAdvancedFilters({
  params,
  onChange,
  canFilterByOwner,
  currentUserId,
}: ChallanAdvancedFiltersProps) {
  const t = useT()

  return (
    <div
      id="challan-advanced-filters"
      className="grid gap-3 border-t bg-muted/25 px-4 py-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-4"
    >
      {/* Also reachable from the attention chips, which is where somebody
          clearing a backlog will actually press it. This is here so the filter
          is discoverable beside the others, and so `partial` — the one whose
          chip is absent whenever the count is zero — has a permanent home.
          Both write the same state, so they cannot drift. */}
      <FilterField id="filter-amount" label={t('challan.filters.amount')}>
        <Select
          value={params.amount}
          onValueChange={(value) => onChange({ amount: value as ChallanAmountFilter })}
        >
          <SelectTrigger id="filter-amount" className="w-full">
            <SelectValue>
              {(value) => t(AMOUNT_KEYS[(value as ChallanAmountFilter) ?? 'all'])}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(Object.keys(AMOUNT_KEYS) as ChallanAmountFilter[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {t(AMOUNT_KEYS[value])}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FilterField>

      {/* The dispatch backlog has chips too; this is where `sent` and
          `delivered` live, which are read rather than worked through and so
          never earn a chip of their own. */}
      <FilterField id="filter-dispatch" label={t('challan.filters.dispatch')}>
        <Select
          value={params.dispatch}
          onValueChange={(value) => onChange({ dispatch: value as ChallanDispatchFilter })}
        >
          <SelectTrigger id="filter-dispatch" className="w-full">
            <SelectValue>
              {(value) => t(DISPATCH_KEYS[(value as ChallanDispatchFilter) ?? 'all'])}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(Object.keys(DISPATCH_KEYS) as ChallanDispatchFilter[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {t(DISPATCH_KEYS[value])}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField id="filter-bill" label={t('challan.filters.bill')}>
        <BillingFilterSelect id="filter-bill" value={params.bill} onChange={(bill) => onChange({ bill })} />
      </FilterField>

      <FilterField id="filter-from" label={t('challan.filters.filedFrom')}>
        <Input
          id="filter-from"
          type="date"
          value={params.from}
          onChange={(event) => onChange({ from: event.target.value })}
        />
      </FilterField>

      <FilterField id="filter-to" label={t('challan.filters.filedTo')}>
        <Input
          id="filter-to"
          type="date"
          value={params.to}
          onChange={(event) => onChange({ to: event.target.value })}
        />
      </FilterField>

      <TextFilter id="filter-customer" label={t('challan.filters.customer')} value={params.customer} onChange={(customer) => onChange({ customer })} />
      <TextFilter id="filter-district" label={t('challan.filters.district')} value={params.district} onChange={(district) => onChange({ district })} />
      <TextFilter id="filter-product" label={t('challan.filters.product')} value={params.product} onChange={(product) => onChange({ product })} />
      <TextFilter id="filter-model" label={t('challan.filters.model')} value={params.model} onChange={(model) => onChange({ model })} />
      <TextFilter id="filter-zonepo" label={t('challan.filters.zonePo')} value={params.zonePo} onChange={(zonePo) => onChange({ zonePo })} />

      {canFilterByOwner && currentUserId && (
        <FilterField id="filter-owner" label={t('challan.filters.filedBy')}>
          <Button
            id="filter-owner"
            variant={params.createdBy ? 'secondary' : 'outline'}
            className="w-full justify-start"
            onClick={() => onChange({ createdBy: params.createdBy ? '' : currentUserId })}
          >
            {params.createdBy ? t('challan.filters.onlyMine') : t('challan.filters.everyone')}
          </Button>
        </FilterField>
      )}
    </div>
  )
}

function TextFilter({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <FilterField id={id} label={label}>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
    </FilterField>
  )
}

function FilterField({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}
