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
import { useT } from '@/lib/i18n'
import { ownershipMeta, vehicleStatusMeta } from '../lib/vendor-meta'
import { VEHICLE_OWNERSHIP_TYPES, VEHICLE_STATUSES } from '../types'
import type {
  VehicleFilterPatch,
  VehicleListParams,
  VehicleOwnershipType,
  VehicleStatus,
} from '../types'

interface VehicleFiltersProps {
  params: VehicleListParams
  onChange: (patch: VehicleFilterPatch) => void
  onReset: () => void
  onAdd: () => void
  canManage: boolean
  summary?: string
}

const TRIGGER = 'h-8 w-full sm:w-[10.5rem]'

/**
 * The vehicles tab's toolbar.
 *
 * The search box covers the plate, the code, the brand and the model, because
 * somebody looking for a vehicle has one of those and rarely knows which. It
 * matches the plate on its normalised form as well, so `DHAKA METRO TA 11 1234`
 * finds a vehicle recorded as `DHAKA METRO-TA-11-1234` — the same key Gate Pass
 * stores a challan's vehicle number under.
 */
export function VehicleFilters({
  params,
  onChange,
  onReset,
  onAdd,
  canManage,
  summary,
}: VehicleFiltersProps) {
  const t = useT()

  const isFiltered =
    params.search !== '' ||
    params.status !== 'all' ||
    params.ownershipType !== 'all' ||
    params.brand !== ''

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
              placeholder={t('vendor.vehicle.searchPlaceholder')}
              aria-label={t('vendor.vehicle.searchAria')}
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Select
              value={params.status}
              onValueChange={(value) => onChange({ status: value as VehicleStatus | 'all' })}
            >
              <SelectTrigger className={TRIGGER} aria-label={t('vendor.vehicle.statusAria')}>
                <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>
                  {(value) =>
                    value && value !== 'all'
                      ? vehicleStatusMeta(value, t).label
                      : t('vendor.filters.anyStatus')
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t('vendor.filters.anyStatus')}</SelectItem>
                  {VEHICLE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      <span
                        className={cn(
                          'size-1.5 shrink-0 rounded-full',
                          vehicleStatusMeta(status, t).dot,
                        )}
                        aria-hidden
                      />
                      {vehicleStatusMeta(status, t).label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.ownershipType}
              onValueChange={(value) =>
                onChange({ ownershipType: value as VehicleOwnershipType | 'all' })
              }
            >
              <SelectTrigger className={TRIGGER} aria-label={t('vendor.vehicle.ownershipAria')}>
                <SelectValue>
                  {(value) =>
                    value && value !== 'all'
                      ? ownershipMeta(value, t).label
                      : t('vendor.filters.anyOwnership')
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t('vendor.filters.anyOwnership')}</SelectItem>
                  {VEHICLE_OWNERSHIP_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {ownershipMeta(type, t).label}
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
                {t('vendor.vehicle.add')}
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
