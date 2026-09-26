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
import { QUICK_RANGE_KEYS } from '@/lib/date-ranges'
import type { QuickRange } from '@/lib/date-ranges'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import {
  MODULE_META,
  categoryMeta,
  entityLabel,
  moduleMeta,
  severityMeta,
} from '../lib/activity-meta'
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
  const t = useT()

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
              placeholder={t('activity.toolbar.searchPlaceholder')}
              aria-label={t('activity.toolbar.searchAria')}
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={params.module}
              onValueChange={(value) => onChange({ module: value as ActivityModuleFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label={t('activity.toolbar.moduleAria')}>
                <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>
                  {(value) =>
                    value === 'all' || !value
                      ? t('activity.toolbar.everyModule')
                      : moduleMeta(String(value), t).label
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t('activity.toolbar.everyModule')}</SelectItem>
                  {ACTIVITY_MODULES.map((module) => (
                    <SelectItem key={module} value={module}>
                      <span
                        className={cn('size-1.5 shrink-0 rounded-full', MODULE_META[module].dot)}
                        aria-hidden
                      />
                      {moduleMeta(module, t).label}
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
                {t('common.actions.clear')}
              </Button>
            )}

            {canExport && (
              <Button variant="outline" size="sm" onClick={onExport} className="shrink-0">
                <Download data-icon="inline-start" aria-hidden />
                {t('common.actions.export')}
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
              {t(QUICK_RANGE_KEYS[quick] as TranslationKey)}
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
              aria-label={t('activity.toolbar.fromDate')}
              className="h-7 min-w-0 flex-1 text-xs sm:w-38 sm:flex-initial"
            />
            <span className="shrink-0 text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={params.to}
              min={params.from || undefined}
              onChange={(event) => onChange({ to: event.target.value })}
              aria-label={t('activity.toolbar.toDate')}
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
              <SelectTrigger className="h-8 w-full" aria-label={t('activity.toolbar.categoryAria')}>
                <SelectValue>
                  {(value) =>
                    value === 'all' || !value
                      ? t('activity.toolbar.anyCategory')
                      : categoryMeta(String(value), t).label
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t('activity.toolbar.anyCategory')}</SelectItem>
                  {ACTIVITY_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {categoryMeta(category, t).label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.severity}
              onValueChange={(value) => onChange({ severity: value as ActivitySeverityFilter })}
            >
              <SelectTrigger className="h-8 w-full" aria-label={t('activity.toolbar.severityAria')}>
                <SelectValue>
                  {(value) =>
                    value === 'all' || !value
                      ? t('activity.toolbar.anySeverity')
                      : severityMeta(String(value), t).label
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t('activity.toolbar.anySeverity')}</SelectItem>
                  {ACTIVITY_SEVERITIES.map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severityMeta(severity, t).label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.action}
              onValueChange={(value) => onChange({ action: value ?? 'all' })}
            >
              <SelectTrigger className="h-8 w-full" aria-label={t('activity.toolbar.actionAria')}>
                <SelectValue>
                  {(value) =>
                    value === 'all' || !value
                      ? t('activity.toolbar.anyAction')
                      : (actions.find((option) => option.action === value)?.label ?? String(value))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t('activity.toolbar.anyAction')}</SelectItem>
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
              <SelectTrigger className="h-8 w-full" aria-label={t('activity.toolbar.entityAria')}>
                <SelectValue>
                  {(value) =>
                    value === 'all' || !value
                      ? t('activity.toolbar.anyEntity')
                      : entityLabel(String(value), t)
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t('activity.toolbar.anyEntity')}</SelectItem>
                  {ACTIVITY_ENTITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {entityLabel(type, t)}
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
              <SelectTrigger className="h-8 w-full" aria-label={t('activity.toolbar.actorAria')}>
                <SelectValue>
                  {(value) =>
                    value === 'all' || !value
                      ? t('activity.toolbar.anyone')
                      : (actors.find((actor) => actor.id === value)?.name ??
                        t('activity.toolbar.anyone'))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t('activity.toolbar.anyone')}</SelectItem>
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
