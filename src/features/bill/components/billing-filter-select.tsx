import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BILLING_FILTER_LABELS } from '../lib/bill-meta'
import type { BillingFilter } from '../types'

interface BillingFilterSelectProps {
  id: string
  value: BillingFilter
  onChange: (value: BillingFilter) => void
}

/**
 * "Not billed", "Partly billed", "Billed" — one control for the challan and
 * gate pass lists, so the two can never word the same question differently.
 */
export function BillingFilterSelect({ id, value, onChange }: BillingFilterSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as BillingFilter)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue>{(current) => BILLING_FILTER_LABELS[(current as BillingFilter) ?? 'all']}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {(Object.keys(BILLING_FILTER_LABELS) as BillingFilter[]).map((option) => (
            <SelectItem key={option} value={option}>
              {BILLING_FILTER_LABELS[option]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
