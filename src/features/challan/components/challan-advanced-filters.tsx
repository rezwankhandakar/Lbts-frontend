import { Button } from '@/components/ui/button'
import { BillingFilterSelect } from '@/features/bill/components/billing-filter-select'
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

const DISPATCH_LABELS: Record<ChallanDispatchFilter, string> = {
  all: 'Any dispatch',
  pending: 'Not dispatched',
  partial: 'Partly sent',
  sent: 'Sent',
  delivered: 'Delivered',
  returned: 'Returned at depot',
}

const AMOUNT_LABELS: Record<ChallanAmountFilter, string> = {
  all: 'Any amount',
  unpriced: 'Blank amount',
  partial: 'Partly charged',
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
      <FilterField id="filter-amount" label="Amount">
        <Select
          value={params.amount}
          onValueChange={(value) => onChange({ amount: value as ChallanAmountFilter })}
        >
          <SelectTrigger id="filter-amount" className="w-full">
            <SelectValue>
              {(value) => AMOUNT_LABELS[(value as ChallanAmountFilter) ?? 'all']}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(Object.keys(AMOUNT_LABELS) as ChallanAmountFilter[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {AMOUNT_LABELS[value]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FilterField>

      {/* The dispatch backlog has chips too; this is where `sent` and
          `delivered` live, which are read rather than worked through and so
          never earn a chip of their own. */}
      <FilterField id="filter-dispatch" label="Dispatch">
        <Select
          value={params.dispatch}
          onValueChange={(value) => onChange({ dispatch: value as ChallanDispatchFilter })}
        >
          <SelectTrigger id="filter-dispatch" className="w-full">
            <SelectValue>
              {(value) => DISPATCH_LABELS[(value as ChallanDispatchFilter) ?? 'all']}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(Object.keys(DISPATCH_LABELS) as ChallanDispatchFilter[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {DISPATCH_LABELS[value]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField id="filter-bill" label="Bill">
        <BillingFilterSelect id="filter-bill" value={params.bill} onChange={(bill) => onChange({ bill })} />
      </FilterField>

      <FilterField id="filter-from" label="Filed from">
        <Input
          id="filter-from"
          type="date"
          value={params.from}
          onChange={(event) => onChange({ from: event.target.value })}
        />
      </FilterField>

      <FilterField id="filter-to" label="Filed to">
        <Input
          id="filter-to"
          type="date"
          value={params.to}
          onChange={(event) => onChange({ to: event.target.value })}
        />
      </FilterField>

      <TextFilter id="filter-customer" label="Customer" value={params.customer} onChange={(customer) => onChange({ customer })} />
      <TextFilter id="filter-district" label="District" value={params.district} onChange={(district) => onChange({ district })} />
      <TextFilter id="filter-product" label="Product" value={params.product} onChange={(product) => onChange({ product })} />
      <TextFilter id="filter-model" label="Model" value={params.model} onChange={(model) => onChange({ model })} />
      <TextFilter id="filter-zonepo" label="Zone / PO" value={params.zonePo} onChange={(zonePo) => onChange({ zonePo })} />

      {canFilterByOwner && currentUserId && (
        <FilterField id="filter-owner" label="Filed by">
          <Button
            id="filter-owner"
            variant={params.createdBy ? 'secondary' : 'outline'}
            className="w-full justify-start"
            onClick={() => onChange({ createdBy: params.createdBy ? '' : currentUserId })}
          >
            {params.createdBy ? 'Only mine' : 'Everyone'}
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
