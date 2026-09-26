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
import { monthName, monthNames, useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { labourBillYearOptions } from '../types'
import type { LabourBillFilterPatch, LabourBillListParams, LabourBillStatusFilter } from '../types'

interface LabourBillListToolbarProps {
  params: LabourBillListParams
  onChange: (patch: LabourBillFilterPatch) => void
  onReset: () => void
  isFiltered: boolean
  summary?: ReactNode
}

const STATUS_OPTIONS: { value: LabourBillStatusFilter; labelKey: TranslationKey }[] = [
  { value: 'all', labelKey: 'labourBill.toolbar.all' },
  { value: 'Draft', labelKey: 'labourBill.toolbar.drafts' },
  { value: 'Finalized', labelKey: 'labourBill.toolbar.finalized' },
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
  const t = useT()

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
            aria-label={t('labourBill.toolbar.searchAria')}
            className="pl-8.5"
          />
        </div>

        <div
          role="radiogroup"
          aria-label={t('labourBill.toolbar.statusAria')}
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
              {t(option.labelKey)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <CalendarDays className="size-3.5 text-muted-foreground" aria-hidden />
          <Select
            value={params.month === null ? ANY : String(params.month)}
            onValueChange={(value) => onChange({ month: value === ANY ? null : Number(value) })}
          >
            <SelectTrigger className="h-8 w-[8.5rem]" aria-label={t('labourBill.toolbar.monthAria')}>
              <SelectValue>
                {(value) =>
                  value === ANY || !value
                    ? t('labourBill.toolbar.anyMonth')
                    : monthName(Number(value))
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={ANY}>{t('labourBill.toolbar.anyMonth')}</SelectItem>
                {monthNames().map((name, index) => (
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
            <SelectTrigger className="h-8 w-[7rem]" aria-label={t('labourBill.toolbar.yearAria')}>
              <SelectValue>
                {(value) =>
                  value === ANY || !value ? t('labourBill.toolbar.anyYear') : String(value)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={ANY}>{t('labourBill.toolbar.anyYear')}</SelectItem>
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
              {t('common.actions.clear')}
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
