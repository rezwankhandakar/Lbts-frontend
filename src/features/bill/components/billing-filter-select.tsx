import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BILLING_FILTER_KEYS } from '../lib/bill-meta'
import type { BillingFilter } from '../types'
import { useT } from '@/lib/i18n'

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
  const t = useT()

  return (
    <Select value={value} onValueChange={(next) => onChange(next as BillingFilter)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue>{(current) => t(BILLING_FILTER_KEYS[(current as BillingFilter) ?? 'all'])}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {(Object.keys(BILLING_FILTER_KEYS) as BillingFilter[]).map((option) => (
            <SelectItem key={option} value={option}>
              {t(BILLING_FILTER_KEYS[option])}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
