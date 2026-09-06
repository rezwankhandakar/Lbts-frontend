import { ListFilter, Plus, Search, X } from 'lucide-react'
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
import { LOCATION_TYPE_META } from '../lib/location-meta'
import { LOCATION_TYPES } from '../types'
import type {
  LocationActiveFilter,
  LocationFilterPatch,
  LocationListParams,
  LocationTypeFilter,
} from '../types'

interface LocationFiltersProps {
  params: LocationListParams
  onChange: (patch: LocationFilterPatch) => void
  onReset: () => void
  onAdd: () => void
  canManage: boolean
  summary?: string
}

const TRIGGER = 'h-8 w-full sm:w-[10.5rem]'

function typeLabel(value: unknown): string {
  return typeof value === 'string' && value !== 'all'
    ? (LOCATION_TYPE_META[value as keyof typeof LOCATION_TYPE_META]?.label ?? value)
    : 'Any location type'
}

const ACTIVE_LABELS: Record<LocationActiveFilter, string> = {
  all: 'Active and inactive',
  active: 'Active only',
  inactive: 'Inactive only',
}

/**
 * Search and filters for the master list.
 *
 * All applied server-side, like every other list in this app. The search box
 * covers both halves of the pair, because somebody looking for a location has
 * either the district or the thana in mind and rarely both.
 *
 * The active filter is three-way rather than a checkbox: "show me the
 * deactivated ones" is a real question — it is how an Admin finds a row they
 * took out of use by mistake, or one that was deactivated automatically
 * because challans referenced it.
 */
export function LocationFilters({
  params,
  onChange,
  onReset,
  onAdd,
  canManage,
  summary,
}: LocationFiltersProps) {
  const isFiltered =
    params.search !== '' ||
    params.district !== '' ||
    params.locationType !== 'all' ||
    params.active !== 'all'

  return (
    <div className="border-b">
      <div className="flex flex-col gap-3 p-3 sm:p-4">
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
              placeholder="District or thana"
              aria-label="Search locations"
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={params.locationType}
              onValueChange={(value) => onChange({ locationType: value as LocationTypeFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label="Filter by location type">
                <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>{typeLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Any location type</SelectItem>
                  {LOCATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      <span
                        className={cn('size-1.5 shrink-0 rounded-full', LOCATION_TYPE_META[type].dot)}
                        aria-hidden
                      />
                      {LOCATION_TYPE_META[type].label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.active}
              onValueChange={(value) => onChange({ active: value as LocationActiveFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label="Filter by whether it is in use">
                <SelectValue>
                  {(value) => ACTIVE_LABELS[(value as LocationActiveFilter) ?? 'all']}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(ACTIVE_LABELS) as LocationActiveFilter[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {ACTIVE_LABELS[value]}
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
                Add location
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
