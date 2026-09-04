import { useState } from 'react'
import { ListFilter, Search, SlidersHorizontal, X } from 'lucide-react'
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
import { QUICK_RANGE_LABELS, quickRangeFor, rangeFor } from '../lib/date-ranges'
import { GATE_PASS_STATUS_META, gatePassStatusMeta } from '../lib/gate-pass-meta'
import { GATE_PASS_REFERENCE_TYPES, GATE_PASS_STATUSES } from '../types'
import type { GatePassListParams, ReferenceTypeFilter, StatusFilter } from '../types'

export type FilterPatch = Partial<Omit<GatePassListParams, 'page' | 'limit'>>

interface GatePassFiltersProps {
  params: GatePassListParams
  onChange: (patch: FilterPatch) => void
  onReset: () => void
  /** Result count, kept on the toolbar line rather than floating above it. */
  summary?: string
  /** Hidden for a role that can only ever see its own records anyway. */
  canFilterByOwner: boolean
  currentUserId: string | null
}

const TRIGGER = 'h-8 w-full sm:w-[10rem]'

function statusLabel(value: unknown): string {
  return typeof value === 'string' && value !== 'all' ? gatePassStatusMeta(value).label : 'Any status'
}

/**
 * Search and filters for the records page.
 *
 * The two an operator reaches for constantly — the text search and the status
 * — stay on the toolbar. Everything else lives behind "More filters", with a
 * count on the button so a filtered-down list is never a mystery. All of it is
 * applied server-side: on an M0 cluster, shipping the collection to the
 * browser to filter it is the one query the free tier cannot afford.
 */
export function GatePassFilters({
  params,
  onChange,
  onReset,
  summary,
  canFilterByOwner,
  currentUserId,
}: GatePassFiltersProps) {
  const [expanded, setExpanded] = useState(false)

  const advancedCount =
    (params.csd ? 1 : 0) +
    (params.unit ? 1 : 0) +
    (params.product ? 1 : 0) +
    (params.referenceType !== 'all' ? 1 : 0) +
    (params.reference ? 1 : 0) +
    (params.createdBy ? 1 : 0) +
    (params.from || params.to ? 1 : 0)

  const isFiltered = advancedCount > 0 || params.search !== '' || params.status !== 'all'
  const quick = quickRangeFor({ from: params.from, to: params.to })

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
              placeholder="Gate pass, DO, customer, vehicle, model"
              aria-label="Search gate passes"
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={params.status}
              onValueChange={(value) => onChange({ status: value as StatusFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label="Filter by status">
                <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>{statusLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Any status</SelectItem>
                  {GATE_PASS_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      <span
                        className={cn('size-1.5 shrink-0 rounded-full', GATE_PASS_STATUS_META[status].dot)}
                        aria-hidden
                      />
                      {GATE_PASS_STATUS_META[status].label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              aria-controls="gate-pass-advanced-filters"
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

        {/* The date range is the filter an operator uses every day, so its
            shortcuts sit on the toolbar even though the dates themselves are
            in the advanced panel. */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'today', 'week', 'month'] as const).map((option) => (
            <Button
              key={option}
              variant={quick === option ? 'secondary' : 'ghost'}
              size="xs"
              onClick={() =>
                onChange(option === 'all' ? { from: '', to: '' } : rangeFor(option))
              }
            >
              {QUICK_RANGE_LABELS[option]}
            </Button>
          ))}
          {quick === 'custom' && (
            <span className="text-xs text-muted-foreground">
              {params.from || '…'} to {params.to || '…'}
            </span>
          )}
        </div>

        {summary && (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {summary}
          </p>
        )}
      </div>

      {expanded && (
        <div
          id="gate-pass-advanced-filters"
          className="grid gap-3 border-t bg-muted/20 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-4"
        >
          <FilterField id="filter-from" label="Trip date from">
            <Input
              id="filter-from"
              type="date"
              value={params.from}
              onChange={(event) => onChange({ from: event.target.value })}
            />
          </FilterField>

          <FilterField id="filter-to" label="Trip date to">
            <Input
              id="filter-to"
              type="date"
              value={params.to}
              onChange={(event) => onChange({ to: event.target.value })}
            />
          </FilterField>

          <FilterField id="filter-csd" label="CSD">
            <Input
              id="filter-csd"
              value={params.csd}
              onChange={(event) => onChange({ csd: event.target.value })}
              placeholder="CSD-04"
              autoComplete="off"
            />
          </FilterField>

          <FilterField id="filter-unit" label="Unit">
            <Input
              id="filter-unit"
              value={params.unit}
              onChange={(event) => onChange({ unit: event.target.value })}
              placeholder="WFR"
              autoComplete="off"
            />
          </FilterField>

          <FilterField id="filter-product" label="Product">
            <Input
              id="filter-product"
              value={params.product}
              onChange={(event) => onChange({ product: event.target.value })}
              placeholder="Refrigerator"
              autoComplete="off"
            />
          </FilterField>

          <FilterField id="filter-reference-type" label="Reference type">
            <Select
              value={params.referenceType}
              onValueChange={(value) => onChange({ referenceType: value as ReferenceTypeFilter })}
            >
              <SelectTrigger id="filter-reference-type" className="w-full">
                <SelectValue>
                  {(value) => (typeof value === 'string' && value !== 'all' ? value : 'Any')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Any</SelectItem>
                  {GATE_PASS_REFERENCE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField id="filter-reference" label="Zone or PO">
            <Input
              id="filter-reference"
              value={params.reference}
              onChange={(event) => onChange({ reference: event.target.value })}
              placeholder="CSD-07 or 627143140"
              autoComplete="off"
            />
          </FilterField>

          {canFilterByOwner && currentUserId && (
            <FilterField id="filter-owner" label="Created by">
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
