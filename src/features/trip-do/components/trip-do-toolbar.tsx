import { CalendarDays, Download, Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QUICK_RANGE_LABELS, quickRangeFor, rangeFor } from '@/lib/date-ranges'
import type { TripDoFilterPatch, TripDoListParams } from '../types'
import { TripDoFilterSelects } from './trip-do-filter-selects'

interface TripDoToolbarProps {
  params: TripDoListParams
  onChange: (patch: TripDoFilterPatch) => void
  onReset: () => void
  isFiltered: boolean
  summary?: ReactNode
  onExport: () => void
  canExport: boolean
  isExporting: boolean
}

const DATE_OPTIONS = ['all', 'today', 'month', 'lastMonth'] as const

/**
 * Search, dates and filters for the sheet — all applied server-side.
 *
 * The search box covers everything a person holding paper might have in front
 * of them: an SL, a challan number, a customer, a receiver's phone, a model, a
 * Trip DO off a gate pass or a trip number.
 */
export function TripDoToolbar({
  params,
  onChange,
  onReset,
  isFiltered,
  summary,
  onExport,
  canExport,
  isExporting,
}: TripDoToolbarProps) {
  const quick = quickRangeFor({ from: params.from, to: params.to })

  return (
    <div className="border-b bg-muted/20">
      <div className="flex flex-col gap-3 p-3 sm:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1 xl:max-w-md">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={params.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="SL, challan, customer, phone, model, Trip DO or trip"
              aria-label="Search the Trip DO sheet"
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <CalendarDays className="size-3.5 text-muted-foreground" aria-hidden />
            {DATE_OPTIONS.map((option) => (
              <Button
                key={option}
                variant={quick === option ? 'secondary' : 'ghost'}
                size="xs"
                aria-pressed={quick === option}
                onClick={() => onChange(option === 'all' ? { from: '', to: '' } : rangeFor(option))}
              >
                {QUICK_RANGE_LABELS[option]}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 xl:ml-auto">
            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
                <X data-icon="inline-start" aria-hidden />
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={!canExport || isExporting}
            >
              <Download data-icon="inline-start" aria-hidden />
              {isExporting ? 'Exporting…' : 'Export Excel'}
            </Button>
          </div>
        </div>

        <TripDoFilterSelects params={params} onChange={onChange} />

        {summary && (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {summary}
          </p>
        )}
      </div>
    </div>
  )
}
