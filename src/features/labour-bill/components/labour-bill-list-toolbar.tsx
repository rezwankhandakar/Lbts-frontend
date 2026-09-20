import { CalendarDays, Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { MONTH_NAMES, labourBillYearOptions } from '../types'
import type { LabourBillFilterPatch, LabourBillListParams, LabourBillStatusFilter } from '../types'

interface LabourBillListToolbarProps {
  params: LabourBillListParams
  onChange: (patch: LabourBillFilterPatch) => void
  onReset: () => void
  isFiltered: boolean
  summary?: ReactNode
}

const STATUS_OPTIONS: { value: LabourBillStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Draft', label: 'Drafts' },
  { value: 'Finalized', label: 'Finalized' },
]

const ANY = 'any'

/** Search, status and period — every one applied server-side. */
export function LabourBillListToolbar({
  params,
  onChange,
  onReset,
  isFiltered,
  summary,
}: LabourBillListToolbarProps) {
  const years = labourBillYearOptions(params.year ?? new Date().getFullYear()).reverse()

  return (
    <div className="flex flex-col gap-3 border-b bg-muted/20 p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={params.search}
            onChange={(event) => onChange({ search: event.target.value })}
            aria-label="Search labour bills by number, company or note"
            className="pl-8.5"
          />
        </div>

        <div
          role="radiogroup"
          aria-label="Labour bill status"
          className="inline-flex w-fit rounded-lg border bg-card p-0.5"
        >
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={params.status === option.value}
              onClick={() => onChange({ status: option.value })}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition',
                params.status === option.value
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <CalendarDays className="size-3.5 text-muted-foreground" aria-hidden />
          <Select
            value={params.month === null ? ANY : String(params.month)}
            onValueChange={(value) => onChange({ month: value === ANY ? null : Number(value) })}
          >
            <SelectTrigger className="h-8 w-[8.5rem]" aria-label="Billing month">
              <SelectValue>
                {(value) => (value === ANY || !value ? 'Any month' : MONTH_NAMES[Number(value) - 1])}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={ANY}>Any month</SelectItem>
                {MONTH_NAMES.map((name, index) => (
                  <SelectItem key={name} value={String(index + 1)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={params.year === null ? ANY : String(params.year)}
            onValueChange={(value) => onChange({ year: value === ANY ? null : Number(value) })}
          >
            <SelectTrigger className="h-8 w-[7rem]" aria-label="Billing year">
              <SelectValue>{(value) => (value === ANY || !value ? 'Any year' : String(value))}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={ANY}>Any year</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
              <X data-icon="inline-start" aria-hidden />
              Clear
            </Button>
          )}
        </div>
      </div>

      {summary && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {summary}
        </p>
      )}
    </div>
  )
}
