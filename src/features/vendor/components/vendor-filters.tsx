import { ArrowUpDown, ListFilter, Plus, Search, ShieldAlert, X } from 'lucide-react'
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
import type { TranslationKey, Translator } from '@/lib/i18n'
import { vendorStatusMeta } from '../lib/vendor-meta'
import { VENDOR_STATUSES } from '../types'
import type {
  ComplianceFilter,
  VendorFilterPatch,
  VendorListParams,
  VendorSort,
  VendorStatusFilter,
} from '../types'

interface VendorFiltersProps {
  params: VendorListParams
  onChange: (patch: VendorFilterPatch) => void
  onReset: () => void
  onAdd: () => void
  canManage: boolean
  summary?: string
}

const TRIGGER = 'h-8 w-full sm:w-[11rem]'

const COMPLIANCE_KEYS: Record<ComplianceFilter, TranslationKey> = {
  all: 'vendor.directory.anyCompliance',
  expired: 'vendor.directory.hasExpired',
  expiring: 'vendor.directory.hasExpiring',
  clear: 'vendor.directory.allInOrder',
}

const SORT_KEYS: Record<VendorSort, TranslationKey> = {
  name: 'vendor.directory.sortName',
  recent: 'vendor.directory.sortRecent',
  vehicles: 'vendor.directory.sortVehicles',
  drivers: 'vendor.directory.sortDrivers',
}

function statusLabel(value: unknown, t: Translator): string {
  return typeof value === 'string' && value !== 'all'
    ? vendorStatusMeta(value, t).label
    : t('vendor.filters.anyStatus')
}

/**
 * Search and filters for the vendor directory.
 *
 * All applied server-side, like every other list in this app. The search box
 * covers the code, the name and the mobile number, because somebody looking for
 * a vendor has one of those in hand and rarely knows which the record was filed
 * under.
 *
 * The compliance filter is the one that earns its place: "which vendors have
 * something expired" is the question an operations manager sits down to answer,
 * and it is a question no amount of scrolling a table answers on its own.
 */
export function VendorFilters({
  params,
  onChange,
  onReset,
  onAdd,
  canManage,
  summary,
}: VendorFiltersProps) {
  const t = useT()

  const isFiltered =
    params.search !== '' || params.status !== 'all' || params.compliance !== 'all'

  return (
    <div className="border-b">
      <div className="flex flex-col gap-3 p-3 sm:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1 xl:max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={params.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder={t('vendor.directory.searchPlaceholder')}
              aria-label={t('vendor.directory.searchAria')}
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Select
              value={params.status}
              onValueChange={(value) => onChange({ status: value as VendorStatusFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label={t('vendor.directory.statusAria')}>
                <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>{(value) => statusLabel(value, t)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t('vendor.filters.anyStatus')}</SelectItem>
                  {VENDOR_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      <span
                        className={cn(
                          'size-1.5 shrink-0 rounded-full',
                          vendorStatusMeta(status, t).dot,
                        )}
                        aria-hidden
                      />
                      {vendorStatusMeta(status, t).label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.compliance}
              onValueChange={(value) => onChange({ compliance: value as ComplianceFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label={t('vendor.directory.complianceAria')}>
                <ShieldAlert className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>
                  {(value) => COMPLIANCE_KEYS[(value as ComplianceFilter) ?? 'all']}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(COMPLIANCE_KEYS) as ComplianceFilter[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(COMPLIANCE_KEYS[value])}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.sort}
              onValueChange={(value) => onChange({ sort: value as VendorSort })}
            >
              <SelectTrigger className={TRIGGER} aria-label={t('vendor.directory.sortAria')}>
                <ArrowUpDown className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>
                  {(value) => SORT_KEYS[(value as VendorSort) ?? 'name']}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(SORT_KEYS) as VendorSort[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(SORT_KEYS[value])}
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
                {t('vendor.directory.add')}
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
