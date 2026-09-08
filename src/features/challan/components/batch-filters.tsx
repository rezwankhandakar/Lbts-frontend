import { ListFilter, Search, X } from 'lucide-react'
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
import type { BatchListParams } from '../api/challan-api'
import type { BatchFilterPatch } from '../hooks/use-batch-list-params'
import { CHALLAN_BATCH_STATUS_META } from '../lib/challan-meta'

interface BatchFiltersProps {
  params: BatchListParams
  onChange: (patch: BatchFilterPatch) => void
  onReset: () => void
  summary?: string
}

const TRIGGER = 'h-8 w-full sm:w-[11rem]'

type BatchStatusFilter = BatchListParams['status']

function statusLabel(value: unknown): string {
  return typeof value === 'string' && value !== 'all'
    ? (CHALLAN_BATCH_STATUS_META[value as 'Processing' | 'Completed']?.label ?? value)
    : 'Any status'
}

/**
 * Search and filter for the source PDF list.
 *
 * Two controls and no "More filters", because a batch has almost nothing to
 * filter on: it is a file name, a date and how far through it somebody got.
 * The search covers the file name, which is the only thing an operator
 * remembers about one — "the PO-1956 file" rather than a serial or a customer.
 *
 * The status filter earns its place on its own: **Processing** is the working
 * list. A file with pages nobody has looked at is the one piece of unfinished
 * business this module can produce, and this is how somebody sits down to
 * clear it.
 */
export function BatchFilters({ params, onChange, onReset, summary }: BatchFiltersProps) {
  const isFiltered = params.search !== '' || params.status !== 'all'

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
              placeholder="Source file name"
              aria-label="Search source PDFs"
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={params.status}
              onValueChange={(value) => onChange({ status: value as BatchStatusFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label="Filter by status">
                <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>{statusLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Any status</SelectItem>
                  {(['Processing', 'Completed'] as const).map((status) => (
                    <SelectItem key={status} value={status}>
                      <span
                        className={cn(
                          'size-1.5 shrink-0 rounded-full',
                          CHALLAN_BATCH_STATUS_META[status].dot,
                        )}
                        aria-hidden
                      />
                      {CHALLAN_BATCH_STATUS_META[status].label}
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
