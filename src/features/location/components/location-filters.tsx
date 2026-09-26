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
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { LOCATION_TYPE_META, locationTypeMeta } from '../lib/location-meta'
import type { TranslationKey } from '@/lib/i18n'
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

const ACTIVE_KEYS: Record<LocationActiveFilter, TranslationKey> = {
  all: 'location.filters.activeAll',
  active: 'location.filters.activeOnly',
  inactive: 'location.filters.inactiveOnly',
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
  const t = useT()

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
              placeholder={t('location.filters.searchPlaceholder')}
              aria-label={t('location.filters.searchAria')}
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={params.locationType}
              onValueChange={(value) => onChange({ locationType: value as LocationTypeFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label={t('location.filters.typeAria')}>
                <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>
                  {(value) =>
                    typeof value === 'string' && value !== 'all'
                      ? locationTypeMeta(value, t).label
                      : t('location.anyType')
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t('location.anyType')}</SelectItem>
                  {LOCATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      <span
                        className={cn('size-1.5 shrink-0 rounded-full', LOCATION_TYPE_META[type].dot)}
                        aria-hidden
                      />
                      {locationTypeMeta(type, t).label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.active}
              onValueChange={(value) => onChange({ active: value as LocationActiveFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label={t('location.filters.activeAria')}>
                <SelectValue>
                  {(value) => t(ACTIVE_KEYS[(value as LocationActiveFilter) ?? 'all'])}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(ACTIVE_KEYS) as LocationActiveFilter[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(ACTIVE_KEYS[value])}
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

            {canManage && (
              <Button size="sm" onClick={onAdd}>
                <Plus data-icon="inline-start" aria-hidden />
                {t('location.addLocation')}
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
