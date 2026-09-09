import { IdCard, ListFilter, Plus, Search, X } from 'lucide-react'
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
import { DRIVER_STATUS_META } from '../lib/vendor-meta'
import { DRIVER_STATUSES } from '../types'
import type { DriverFilterPatch, DriverListParams, DriverStatus } from '../types'

interface DriverFiltersProps {
  params: DriverListParams
  onChange: (patch: DriverFilterPatch) => void
  onReset: () => void
  onAdd: () => void
  canManage: boolean
  summary?: string
}

const TRIGGER = 'h-8 w-full sm:w-[10.5rem]'

const LICENCE_LABELS: Record<DriverListParams['licence'], string> = {
  all: 'Any licence',
  expired: 'Licence expired',
  expiring: 'Licence expiring',
}

/**
 * The drivers tab's toolbar.
 *
 * The licence filter is the one that earns its place beside the status one:
 * "whose licence lapses this month" is a question somebody sits down to answer,
 * and it is a range query on an indexed field rather than something a person can
 * work out by reading a column of dates.
 */
export function DriverFilters({
  params,
  onChange,
  onReset,
  onAdd,
  canManage,
  summary,
}: DriverFiltersProps) {
  const isFiltered = params.search !== '' || params.status !== 'all' || params.licence !== 'all'

  return (
    <div className="border-b">
      <div className="flex flex-col gap-3 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={params.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Name, mobile or licence number"
              aria-label="Search drivers"
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Select
              value={params.status}
              onValueChange={(value) => onChange({ status: value as DriverStatus | 'all' })}
            >
              <SelectTrigger className={TRIGGER} aria-label="Filter by driver status">
                <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>
                  {(value) =>
                    value && value !== 'all'
                      ? DRIVER_STATUS_META[value as DriverStatus].label
                      : 'Any status'
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Any status</SelectItem>
                  {DRIVER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      <span
                        className={cn(
                          'size-1.5 shrink-0 rounded-full',
                          DRIVER_STATUS_META[status].dot,
                        )}
                        aria-hidden
                      />
                      {DRIVER_STATUS_META[status].label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.licence}
              onValueChange={(value) =>
                onChange({ licence: value as DriverListParams['licence'] })
              }
            >
              <SelectTrigger className={TRIGGER} aria-label="Filter by licence expiry">
                <IdCard className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>
                  {(value) => LICENCE_LABELS[(value as DriverListParams['licence']) ?? 'all']}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(LICENCE_LABELS) as DriverListParams['licence'][]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {LICENCE_LABELS[value]}
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

            {canManage && (
              <Button size="sm" onClick={onAdd}>
                <Plus data-icon="inline-start" aria-hidden />
                Add driver
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
    </div>
  )
}
