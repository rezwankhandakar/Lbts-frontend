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
import {
  ROLE_META,
  STATUS_META,
  USER_ROLES,
  USER_STATUSES,
  roleMeta,
  statusMeta,
} from '@/lib/roles'
import { cn } from '@/lib/utils'
import type { RoleFilter, StatusFilter } from '../types'

interface UserFiltersProps {
  search: string
  role: RoleFilter
  status: StatusFilter
  onSearchChange: (value: string) => void
  onRoleChange: (value: RoleFilter) => void
  onStatusChange: (value: StatusFilter) => void
  onReset: () => void
  /** Rendered beside the filters; keeps the result count on one toolbar line. */
  summary?: string
}

const TRIGGER = 'h-8 w-full sm:w-[9.5rem]'

/**
 * Base UI renders the raw value in the trigger unless it is told otherwise, so
 * an unmapped filter would read 'all' rather than 'All roles'.
 */
function roleLabel(value: unknown): string {
  return typeof value === 'string' && value !== 'all' ? roleMeta(value).label : 'All roles'
}

function statusLabel(value: unknown): string {
  return typeof value === 'string' && value !== 'all' ? statusMeta(value).label : 'All status'
}

/**
 * Local to Administration by design — this filters the user directory, it is
 * not an app-wide search. The text field is debounced by the page, so typing
 * does not fire a request per keystroke.
 */
export function UserFilters({
  search,
  role,
  status,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onReset,
  summary,
}: UserFiltersProps) {
  const isFiltered = search !== '' || role !== 'all' || status !== 'all'

  return (
    <div className="flex flex-col gap-3 border-b p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name or email"
            aria-label="Search users"
            className="pl-8.5"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={role} onValueChange={(value) => onRoleChange(value as RoleFilter)}>
            <SelectTrigger className={TRIGGER} aria-label="Filter by role">
              <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
              <SelectValue>{roleLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All roles</SelectItem>
                {USER_ROLES.map((option) => (
                  <SelectItem key={option} value={option}>
                    <span
                      className={cn('size-1.5 shrink-0 rounded-full', ROLE_META[option].dot)}
                      aria-hidden
                    />
                    {ROLE_META[option].label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(value) => onStatusChange(value as StatusFilter)}>
            <SelectTrigger className={TRIGGER} aria-label="Filter by account status">
              <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
              <SelectValue>{statusLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All status</SelectItem>
                {USER_STATUSES.map((option) => (
                  <SelectItem key={option} value={option}>
                    <span
                      className={cn('size-1.5 shrink-0 rounded-full', STATUS_META[option].dot)}
                      aria-hidden
                    />
                    {STATUS_META[option].label}
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
  )
}
