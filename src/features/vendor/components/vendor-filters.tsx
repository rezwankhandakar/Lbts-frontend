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
import { VENDOR_STATUS_META } from '../lib/vendor-meta'
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

const COMPLIANCE_LABELS: Record<ComplianceFilter, string> = {
  all: 'Any compliance',
  expired: 'Has expired papers',
  expiring: 'Has papers due',
  clear: 'All papers in order',
}

const SORT_LABELS: Record<VendorSort, string> = {
  name: 'Name (A–Z)',
  recent: 'Recently added',
  vehicles: 'Most vehicles',
  drivers: 'Most drivers',
}

function statusLabel(value: unknown): string {
  return typeof value === 'string' && value !== 'all'
    ? (VENDOR_STATUS_META[value as keyof typeof VENDOR_STATUS_META]?.label ?? value)
    : 'Any status'
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
              placeholder="Vendor name, code or mobile"
              aria-label="Search vendors"
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Select
              value={params.status}
              onValueChange={(value) => onChange({ status: value as VendorStatusFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label="Filter by vendor status">
                <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>{statusLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Any status</SelectItem>
                  {VENDOR_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      <span
                        className={cn(
                          'size-1.5 shrink-0 rounded-full',
                          VENDOR_STATUS_META[status].dot,
                        )}
                        aria-hidden
                      />
                      {VENDOR_STATUS_META[status].label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.compliance}
              onValueChange={(value) => onChange({ compliance: value as ComplianceFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label="Filter by compliance">
                <ShieldAlert className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>
                  {(value) => COMPLIANCE_LABELS[(value as ComplianceFilter) ?? 'all']}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(COMPLIANCE_LABELS) as ComplianceFilter[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {COMPLIANCE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.sort}
              onValueChange={(value) => onChange({ sort: value as VendorSort })}
            >
              <SelectTrigger className={TRIGGER} aria-label="Sort vendors">
                <ArrowUpDown className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>
                  {(value) => SORT_LABELS[(value as VendorSort) ?? 'name']}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(SORT_LABELS) as VendorSort[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {SORT_LABELS[value]}
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
                Add vendor
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
