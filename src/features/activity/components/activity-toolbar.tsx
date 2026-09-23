import { Download, ListFilter, Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
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
import { QUICK_RANGE_LABELS } from '@/lib/date-ranges'
import type { QuickRange } from '@/lib/date-ranges'
import { cn } from '@/lib/utils'
import { CATEGORY_META, MODULE_META, SEVERITY_META, entityLabel } from '../lib/activity-meta'
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_ENTITY_TYPES,
  ACTIVITY_MODULES,
  ACTIVITY_SEVERITIES,
} from '../types'
import type {
  ActivityCategoryFilter,
  ActivityEntityFilter,
  ActivityFilterOptions,
  ActivityFilterPatch,
  ActivityListParams,
  ActivityModuleFilter,
  ActivitySeverityFilter,
} from '../types'

interface ActivityToolbarProps {
  params: ActivityListParams
  options: ActivityFilterOptions | undefined
  quickRange: QuickRange
  isFiltered: boolean
  canExport: boolean
  summary?: string
  onChange: (patch: ActivityFilterPatch) => void
  onQuickRange: (quick: QuickRange) => void
  onReset: () => void
  onExport: () => void
}

const TRIGGER = 'h-8 w-full sm:w-[11rem]'
const QUICK_RANGES: Exclude<QuickRange, 'custom'>[] = ['all', 'today', 'month', 'lastMonth']

/**
 * Search and filters for the journal.
 *
 * All applied server-side, like every other list in this app.
 *
 * **Two rows, and which filter sits in which is the design.** The first row is
 * what somebody opens the page holding: a search, the module, and the date. The
 * rest — category, severity, the exact action, the record type, the person —
 * are behind *More filters*, because they are how a question gets narrowed
 * once the obvious cut has been made, and five more selects across the top
 * would make the common case look like a control panel.
 *
 * The **action** select is fed from the server rather than a mirrored list.
 * Sixty action strings hand-copied into the client would be sixty chances to
 * drift, and a filter that silently matches nothing is the one failure a
 * journal cannot carry.
 */
export function ActivityToolbar({
  params,
  options,
  quickRange,
  isFiltered,
  canExport,
  summary,
  onChange,
  onQuickRange,
  onReset,
  onExport,
}: ActivityToolbarProps) {
  const [showMore, setShowMore] = useState(false)

  /** Filters living behind the disclosure, so it can say how many are on. */
  const hiddenActive = [
    params.category !== 'all',
    params.severity !== 'all',
    params.action !== 'all',
    params.entityType !== 'all',
    params.actorId !== '',
  ].filter(Boolean).length

  const actions = options?.actions ?? []
  const actors = options?.actors ?? []

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
              placeholder="What happened, which record, or who"
              aria-label="Search the journal"
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={params.module}
              onValueChange={(value) => onChange({ module: value as ActivityModuleFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label="Filter by module">
                <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>
                  {(value) => (value === 'all' || !value ? 'Every module' : String(value))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Every module</SelectItem>
                  {ACTIVITY_MODULES.map((module) => (
                    <SelectItem key={module} value={module}>
                      <span
                        className={cn('size-1.5 shrink-0 rounded-full', MODULE_META[module].dot)}
                        aria-hidden
                      />
                      {MODULE_META[module].label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              variant={hiddenActive > 0 ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowMore((open) => !open)}
              aria-expanded={showMore}
              className="shrink-0"
            >
              <SlidersHorizontal data-icon="inline-start" aria-hidden />
              More filters
              {hiddenActive > 0 && (
                <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-px text-[10px] font-semibold tabular-nums">
                  {hiddenActive}
                </span>
              )}
            </Button>

            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
                <X data-icon="inline-start" aria-hidden />
                Clear
              </Button>
            )}

            {canExport && (
              <Button variant="outline" size="sm" onClick={onExport} className="shrink-0">
                <Download data-icon="inline-start" aria-hidden />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* The date chips: the one filter almost every reading of a journal
            starts from, so it stays in the open row rather than behind the
            disclosure. */}
        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_RANGES.map((quick) => (
            <Button
              key={quick}
              type="button"
              size="sm"
              variant={quickRange === quick ? 'secondary' : 'ghost'}
              aria-pressed={quickRange === quick}
              onClick={() => onQuickRange(quick)}
              className="h-7 px-2.5 text-xs"
            >
              {QUICK_RANGE_LABELS[quick]}
            </Button>
          ))}

          <span className="mx-1 hidden h-4 w-px bg-border sm:block" aria-hidden />

          {/* The pair takes the whole row on a phone and shares it, rather
              than being two fixed boxes side by side — those overflow a 360px
              screen, which is the same correction the Accounts cash book
              filters already carry. */}
          <div className="flex w-full min-w-0 items-center gap-1.5 sm:w-auto">
            <Input
              type="date"
              value={params.from}
              max={params.to || undefined}
              onChange={(event) => onChange({ from: event.target.value })}
              aria-label="From date"
              className="h-7 min-w-0 flex-1 text-xs sm:w-38 sm:flex-initial"
            />
            <span className="shrink-0 text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={params.to}
              min={params.from || undefined}
              onChange={(event) => onChange({ to: event.target.value })}
              aria-label="To date"
              className="h-7 min-w-0 flex-1 text-xs sm:w-38 sm:flex-initial"
            />
          </div>
        </div>

        {showMore && (
          <div className="grid gap-2 border-t pt-3 sm:grid-cols-2 xl:grid-cols-5">
            <Select
              value={params.category}
              onValueChange={(value) => onChange({ category: value as ActivityCategoryFilter })}
            >
              <SelectTrigger className="h-8 w-full" aria-label="Filter by kind of change">
                <SelectValue>
                  {(value) =>
                    value === 'all' || !value
                      ? 'Any kind of change'
                      : (CATEGORY_META[value as keyof typeof CATEGORY_META]?.label ?? String(value))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Any kind of change</SelectItem>
                  {ACTIVITY_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {CATEGORY_META[category].label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.severity}
              onValueChange={(value) => onChange({ severity: value as ActivitySeverityFilter })}
            >
              <SelectTrigger className="h-8 w-full" aria-label="Filter by how much it matters">
                <SelectValue>
                  {(value) =>
                    value === 'all' || !value
                      ? 'Any importance'
                      : (SEVERITY_META[value as keyof typeof SEVERITY_META]?.label ?? String(value))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Any importance</SelectItem>
                  {ACTIVITY_SEVERITIES.map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {SEVERITY_META[severity].label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.action}
              onValueChange={(value) => onChange({ action: value ?? 'all' })}
            >
              <SelectTrigger className="h-8 w-full" aria-label="Filter by exact action">
                <SelectValue>
                  {(value) =>
                    value === 'all' || !value
                      ? 'Any action'
                      : (actions.find((option) => option.action === value)?.label ?? String(value))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Any action</SelectItem>
                  {actions
                    .filter(
                      (option) => params.module === 'all' || option.module === params.module,
                    )
                    .map((option) => (
                      <SelectItem key={option.action} value={option.action}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.entityType}
              onValueChange={(value) => onChange({ entityType: value as ActivityEntityFilter })}
            >
              <SelectTrigger className="h-8 w-full" aria-label="Filter by record type">
                <SelectValue>
                  {(value) =>
                    value === 'all' || !value ? 'Any record' : entityLabel(String(value))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Any record</SelectItem>
                  {ACTIVITY_ENTITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {entityLabel(type)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Read off the journal rather than the user list: an account
                deleted last month still has a trail, and offering only current
                accounts would hide exactly the rows somebody is looking for. */}
            <Select
              value={params.actorId || 'all'}
              onValueChange={(value) => onChange({ actorId: !value || value === 'all' ? '' : value })}
            >
              <SelectTrigger className="h-8 w-full" aria-label="Filter by who did it">
                <SelectValue>
                  {(value) =>
                    value === 'all' || !value
                      ? 'Anyone'
                      : (actors.find((actor) => actor.id === value)?.name ?? 'Anyone')
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Anyone</SelectItem>
                  {actors.map((actor) => (
                    <SelectItem key={actor.id ?? actor.name} value={actor.id ?? ''}>
                      {actor.name}
                      <span className="ml-auto pl-3 text-xs text-muted-foreground tabular-nums">
                        {actor.count}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        {summary && (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {summary}
          </p>
        )}
      </div>
    </div>
  )
}
