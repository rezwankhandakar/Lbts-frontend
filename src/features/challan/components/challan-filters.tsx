import { useState } from 'react'
import { Boxes, ListFilter, MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { LOCATION_STATUS_META } from '@/features/location/lib/location-meta'
import { CHALLAN_STATUS_META, challanStatusMeta } from '../lib/challan-meta'
import { CHALLAN_STATUSES } from '../types'
import type {
  ChallanFilterPatch,
  ChallanListParams,
  ChallanLocationFilter,
  ChallanStatusFilter,
} from '../types'

interface ChallanFiltersProps {
  params: ChallanListParams
  onChange: (patch: ChallanFilterPatch) => void
  onReset: () => void
  /** Result count, kept on the toolbar line rather than floating above it. */
  summary?: string
  /**
   * Quantity carried by every record these filters match — the whole set, not
   * the ten rows on screen. Undefined until the first page has landed.
   */
  totalQty?: number
  /** Hidden for a role that can only ever see its own records anyway. */
  canFilterByOwner: boolean
  currentUserId: string | null
  /** Hidden on the batch page, where the batch is the route rather than a filter. */
  hideBatchFilter?: boolean
}

const TRIGGER = 'h-8 w-full sm:w-[10rem]'

function locationLabel(value: unknown): string {
  if (value === 'verified') return 'Location set'
  if (value === 'pending') return 'Location pending'
  return 'Any location'
}

function statusLabel(value: unknown): string {
  return typeof value === 'string' && value !== 'all'
    ? challanStatusMeta(value).label
    : 'Any status'
}

/**
 * Search and filters for the records page.
 *
 * The two an operator reaches for constantly — the text search and the status
 * — stay on the toolbar. Everything else lives behind "More filters", with a
 * count on the button so a filtered-down list is never a mystery. All of it is
 * applied server-side: on an M0 cluster, shipping the collection to the
 * browser to filter it is the one query the free tier cannot afford.
 *
 * The search box covers the challan number, the SL, the customer, the address
 * and the product, because those are the five things somebody has in front of
 * them when they come looking — a number read off a printed back page, or a
 * customer who has just rung up.
 */
export function ChallanFilters({
  params,
  onChange,
  onReset,
  summary,
  totalQty,
  canFilterByOwner,
  currentUserId,
  hideBatchFilter,
}: ChallanFiltersProps) {
  const [expanded, setExpanded] = useState(false)

  const advancedCount =
    (params.district ? 1 : 0) +
    (params.customer ? 1 : 0) +
    (params.product ? 1 : 0) +
    (params.model ? 1 : 0) +
    (params.zonePo ? 1 : 0) +
    (params.createdBy ? 1 : 0) +
    (params.from || params.to ? 1 : 0) +
    (!hideBatchFilter && params.batchId ? 1 : 0)

  const isFiltered =
    advancedCount > 0 ||
    params.search !== '' ||
    params.status !== 'all' ||
    params.location !== 'all'

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
              placeholder="Challan no, SL, customer, address, product"
              aria-label="Search challans"
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={params.status}
              onValueChange={(value) => onChange({ status: value as ChallanStatusFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label="Filter by status">
                <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>{statusLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Any status</SelectItem>
                  {CHALLAN_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      <span
                        className={cn(
                          'size-1.5 shrink-0 rounded-full',
                          CHALLAN_STATUS_META[status].dot,
                        )}
                        aria-hidden
                      />
                      {CHALLAN_STATUS_META[status].label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* On the toolbar rather than behind "More filters", because
                "which challans still need a location?" is the question an
                administrator sits down to answer — and one behind two clicks
                is one nobody asks. */}
            <Select
              value={params.location}
              onValueChange={(value) => onChange({ location: value as ChallanLocationFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label="Filter by location">
                <MapPin className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>{locationLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Any location</SelectItem>
                  <SelectItem value="verified">
                    <span
                      className={cn('size-1.5 shrink-0 rounded-full', LOCATION_STATUS_META.Verified.dot)}
                      aria-hidden
                    />
                    Location set
                  </SelectItem>
                  <SelectItem value="pending">
                    <span
                      className={cn('size-1.5 shrink-0 rounded-full', LOCATION_STATUS_META.Pending.dot)}
                      aria-hidden
                    />
                    Location pending
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              aria-controls="challan-advanced-filters"
            >
              <SlidersHorizontal data-icon="inline-start" aria-hidden />
              More filters
              {advancedCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {advancedCount}
                </Badge>
              )}
            </Button>

            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
                <X data-icon="inline-start" aria-hidden />
                Clear
              </Button>
            )}
          </div>
        </div>

        {summary && (
          <div
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"
            aria-live="polite"
          >
            <span>{summary}</span>
            {/* A count of records answers how many challans; this answers how
                many units were moved, which is the figure a reconciliation is
                actually after. */}
            {totalQty !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 font-medium text-primary tabular-nums">
                <Boxes className="size-3" aria-hidden />
                Total qty {totalQty.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>

      {expanded && (
        <div
          id="challan-advanced-filters"
          className="grid gap-3 border-t bg-muted/20 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-4"
        >
          <FilterField id="filter-from" label="Filed from">
            <Input
              id="filter-from"
              type="date"
              value={params.from}
              onChange={(event) => onChange({ from: event.target.value })}
            />
          </FilterField>

          <FilterField id="filter-to" label="Filed to">
            <Input
              id="filter-to"
              type="date"
              value={params.to}
              onChange={(event) => onChange({ to: event.target.value })}
            />
          </FilterField>

          <FilterField id="filter-customer" label="Customer">
            <Input
              id="filter-customer"
              value={params.customer}
              onChange={(event) => onChange({ customer: event.target.value })}
              autoComplete="off"
            />
          </FilterField>

          <FilterField id="filter-district" label="District">
            <Input
              id="filter-district"
              value={params.district}
              onChange={(event) => onChange({ district: event.target.value })}
              autoComplete="off"
            />
          </FilterField>

          <FilterField id="filter-product" label="Product">
            <Input
              id="filter-product"
              value={params.product}
              onChange={(event) => onChange({ product: event.target.value })}
              autoComplete="off"
            />
          </FilterField>

          <FilterField id="filter-model" label="Model">
            <Input
              id="filter-model"
              value={params.model}
              onChange={(event) => onChange({ model: event.target.value })}
              autoComplete="off"
            />
          </FilterField>

          <FilterField id="filter-zonepo" label="Zone / PO">
            <Input
              id="filter-zonepo"
              value={params.zonePo}
              onChange={(event) => onChange({ zonePo: event.target.value })}
              autoComplete="off"
            />
          </FilterField>

          {canFilterByOwner && currentUserId && (
            <FilterField id="filter-owner" label="Filed by">
              <Button
                id="filter-owner"
                variant={params.createdBy ? 'secondary' : 'outline'}
                className="w-full justify-start"
                onClick={() => onChange({ createdBy: params.createdBy ? '' : currentUserId })}
              >
                {params.createdBy ? 'Only mine' : 'Everyone'}
              </Button>
            </FilterField>
          )}
        </div>
      )}
    </div>
  )
}

function FilterField({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}
