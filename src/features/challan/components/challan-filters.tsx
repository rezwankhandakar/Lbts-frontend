import { useState } from 'react'
import { ListFilter, MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
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
import { LOCATION_REVIEW_META, LOCATION_STATUS_META } from '@/features/location/lib/location-meta'
import { CHALLAN_STATUS_META, challanStatusMeta } from '../lib/challan-meta'
import { BacklogChips } from './backlog-chips'
import { ChallanAdvancedFilters } from './challan-advanced-filters'
import { ChallanDateChips } from './challan-date-chips'
import { ChallanListSummary } from './challan-list-summary'
import { CHALLAN_STATUSES } from '../types'
import type {
  ChallanFilterPatch,
  ChallanListParams,
  ChallanLocationFilter,
  ChallanStatusFilter,
  PageMeta,
} from '../types'

interface ChallanFiltersProps {
  params: ChallanListParams
  onChange: (patch: ChallanFilterPatch) => void
  onReset: () => void
  /** Result count, kept on the toolbar rather than floating above it. */
  summary?: string
  /**
   * The response envelope for the set these filters match — the whole set, not
   * the ten rows on screen. Undefined until the first page has landed.
   */
  meta?: PageMeta
  /** Hidden for a role that can only ever see its own records anyway. */
  canFilterByOwner: boolean
  currentUserId: string | null
  /** Hidden on the batch page, where the batch is the route rather than a filter. */
  hideBatchFilter?: boolean
}

const CONTROL = 'h-9'
const TRIGGER = cn(CONTROL, 'w-full sm:w-[10.5rem]')

function locationLabel(value: unknown): string {
  if (value === 'verified') return 'Location set'
  if (value === 'pending') return 'Location pending'
  if (value === 'review') return 'Unconfirmed match'
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
 * them when they come looking.
 */
export function ChallanFilters({
  params,
  onChange,
  onReset,
  summary,
  meta,
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
    (params.dispatch !== 'all' ? 1 : 0) +
    (!hideBatchFilter && params.batchId ? 1 : 0)

  const isFiltered =
    advancedCount > 0 ||
    params.search !== '' ||
    params.status !== 'all' ||
    params.location !== 'all' ||
    params.amount !== 'all'

  return (
    <div className="border-b">
      <div className="flex flex-col gap-3 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={params.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Search challan no, SL, customer, address, product"
              aria-label="Search challans"
              className={cn(CONTROL, 'pl-9')}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
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
                  <SelectItem value="review">
                    <span
                      className={cn('size-1.5 shrink-0 rounded-full', LOCATION_REVIEW_META.dot)}
                      aria-hidden
                    />
                    Unconfirmed match
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              variant={expanded ? 'secondary' : 'outline'}
              className={CONTROL}
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              aria-controls="challan-advanced-filters"
            >
              <SlidersHorizontal data-icon="inline-start" aria-hidden />
              More filters
              {advancedCount > 0 && (
                <span className="ml-0.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground tabular-nums">
                  {advancedCount}
                </span>
              )}
            </Button>

            {isFiltered && (
              <Button
                variant="ghost"
                onClick={onReset}
                className={cn(CONTROL, 'text-muted-foreground')}
              >
                <X data-icon="inline-start" aria-hidden />
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <ChallanDateChips params={params} onChange={onChange} />
          {summary && <ChallanListSummary summary={summary} meta={meta} />}
        </div>
      </div>

      {expanded && (
        <ChallanAdvancedFilters
          params={params}
          onChange={onChange}
          canFilterByOwner={canFilterByOwner}
          currentUserId={currentUserId}
        />
      )}

      {/* What still wants attention. Each one is a filter rather than a
          figure, because a count nobody can act on is a number to scroll
          past. */}
      <BacklogChips
        meta={meta}
        params={params}
        onChange={onChange}
        className="border-t bg-muted/20 px-4 py-2.5 sm:px-5"
      />
    </div>
  )
}
