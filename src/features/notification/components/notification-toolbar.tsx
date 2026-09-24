import { useState } from 'react'
import { ListFilter, Search, SlidersHorizontal, X } from 'lucide-react'
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
import { NOTIFICATION_MODULE_META } from '../lib/notification-meta'
import { NOTIFICATION_MODULES } from '../types'
import type {
  NotificationListParams,
  NotificationModule,
  NotificationState,
  NotificationVocabularyEntry,
} from '../types'
import type { NotificationFilterPatch } from '../hooks/use-notification-params'
import { NotificationBulkActions } from './notification-bulk-actions'
import { NotificationFilterRow } from './notification-filter-row'

interface NotificationToolbarProps {
  params: NotificationListParams
  vocabulary: NotificationVocabularyEntry[]
  isFiltered: boolean
  summary?: string
  hasUnread: boolean
  hasRead: boolean
  isBusy: boolean
  onChange: (patch: NotificationFilterPatch) => void
  onReset: () => void
  onMarkAllRead: () => void
  onClearRead: () => void
  onOpenPreferences: () => void
}

const STATES: { value: NotificationState; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
]

/**
 * Search and filters for the notification list.
 *
 * **Two rows, and which control sits in which is the design** — the arrangement
 * the journal's toolbar states. The open row is what somebody arrives holding: a
 * search, read-or-unread, and the module. Kind, priority and the exact event sit
 * behind *More filters* (`NotificationFilterRow`), because they are how a
 * question gets narrowed once the obvious cut is made, and five selects across
 * the top would make the common case look like a control panel.
 *
 * Read-or-unread is a first-class select rather than one of the filters behind
 * the disclosure, because it is the filter this list is genuinely used with:
 * somebody opening this page is asking what they have not dealt with yet.
 *
 * All applied server-side, like every other list in this app.
 */
export function NotificationToolbar({
  params,
  vocabulary,
  isFiltered,
  summary,
  hasUnread,
  hasRead,
  isBusy,
  onChange,
  onReset,
  onMarkAllRead,
  onClearRead,
  onOpenPreferences,
}: NotificationToolbarProps) {
  const [showMore, setShowMore] = useState(false)

  /** Filters living behind the disclosure, so it can say how many are on. */
  const hiddenActive = [
    params.category !== 'all',
    params.priority !== 'all',
    params.event !== 'all',
  ].filter(Boolean).length

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
              placeholder="What it says, or which record"
              aria-label="Search notifications"
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={params.state}
              onValueChange={(value) => onChange({ state: value as NotificationState })}
            >
              <SelectTrigger className="h-8 w-full sm:w-36" aria-label="Filter by read state">
                <SelectValue>
                  {(value) => STATES.find((state) => state.value === value)?.label ?? 'Everything'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.module}
              onValueChange={(value) => onChange({ module: value as NotificationModule | 'all' })}
            >
              <SelectTrigger className="h-8 w-full sm:w-44" aria-label="Filter by module">
                <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>
                  {(value) => (value === 'all' || !value ? 'Every module' : String(value))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Every module</SelectItem>
                  {NOTIFICATION_MODULES.map((module) => (
                    <SelectItem key={module} value={module}>
                      <span
                        className={cn(
                          'size-1.5 shrink-0 rounded-full',
                          NOTIFICATION_MODULE_META[module].dot,
                        )}
                        aria-hidden
                      />
                      {NOTIFICATION_MODULE_META[module].label}
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
          </div>
        </div>

        {showMore && (
          <NotificationFilterRow params={params} vocabulary={vocabulary} onChange={onChange} />
        )}

        <NotificationBulkActions
          summary={summary}
          hasUnread={hasUnread}
          hasRead={hasRead}
          isBusy={isBusy}
          onMarkAllRead={onMarkAllRead}
          onClearRead={onClearRead}
          onOpenPreferences={onOpenPreferences}
        />
      </div>
    </div>
  )
}
