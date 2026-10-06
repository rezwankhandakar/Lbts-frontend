import { useState } from 'react'
import { ChevronDown, ListFilter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ColumnFilterValue, ColumnValuesResult } from '@/lib/column-filters'
import { useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface ColumnFilterDropdownProps {
  label: string
  /** The column's ticks as applied; absent or empty is no filter. */
  applied: ColumnFilterValue[] | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  data: ColumnValuesResult | undefined
  isLoading: boolean
  errorMessage: string | null
  /** A value as the cell in this column draws it. */
  labelOf: (value: ColumnFilterValue) => string
  /** The ticks to apply, or null for no filter. */
  onApply: (values: ColumnFilterValue[] | null) => void
}

const keyOf = (value: ColumnFilterValue) => JSON.stringify(value)

/**
 * A column's filter, the way a spreadsheet's works: a dropdown of every value
 * in the column — `(Blanks)` among them — each with how many rows hold it, and
 * a tick box beside each. The ticks are a draft until Apply, so ticking ten
 * customers is one request, not ten.
 *
 * The box at the top narrows the list, it does not filter the sheet: a column
 * of two hundred models is found by typing four characters and then ticked.
 * While nothing has been ticked by hand, what the search shows *is* the
 * selection — type, Apply, and the sheet holds the matches — which is what a
 * spreadsheet does. Once a tick has been set by hand the ticks are explicit and
 * a search only decides which of them are on screen.
 *
 * Moved out of the Trip DO sheet when the gate pass records wanted the same
 * dropdown. The caller owns `open`, so it can fetch the values only while the
 * dropdown is showing.
 */
export function ColumnFilterDropdown({
  label,
  applied,
  open,
  onOpenChange,
  data,
  isLoading,
  errorMessage,
  labelOf,
  onApply,
}: ColumnFilterDropdownProps) {
  const t = useT()
  const format = useFormatters()

  /** Null is "everything ticked", which is no filter at all. */
  const [draft, setDraft] = useState<ColumnFilterValue[] | null>(null)
  const [query, setQuery] = useState('')
  const isActive = Boolean(applied && applied.length > 0)
  const values = data?.values ?? []

  const needle = query.trim().toLowerCase()
  const visible = needle
    ? values.filter((entry) => labelOf(entry.value).toLowerCase().includes(needle))
    : values
  const visibleValues = visible.map((entry) => entry.value)

  const has = (list: ColumnFilterValue[], value: ColumnFilterValue) =>
    list.some((ticked) => keyOf(ticked) === keyOf(value))

  /** Every value ticked is no filter, whichever way the ticks got there. */
  const normalised = (next: ColumnFilterValue[]) =>
    values.length > 0 && values.every((entry) => has(next, entry.value)) ? null : next

  const isChecked = (value: ColumnFilterValue) => draft === null || has(draft, value)
  const allVisibleChecked = visibleValues.every(isChecked)

  const toggle = (value: ColumnFilterValue) => {
    // Untouched ticks under a search mean "what is listed", not the whole column.
    const current = draft ?? visibleValues
    setDraft(
      normalised(isChecked(value) ? current.filter((ticked) => keyOf(ticked) !== keyOf(value)) : [...current, value]),
    )
  }

  const toggleAll = () => {
    if (!needle) {
      setDraft(draft === null ? [] : null)
      return
    }
    const rest = (draft ?? []).filter((ticked) => !has(visibleValues, ticked))
    setDraft(normalised(allVisibleChecked ? rest : [...rest, ...visibleValues]))
  }

  /** What Apply would send: null is no filter. */
  const pending = draft === null && needle ? normalised(visibleValues) : draft
  const nothingToApply = pending !== null && pending.length === 0

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraft(isActive && applied ? applied : null)
      setQuery('')
    }
    onOpenChange(next)
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={
            isActive
              ? t('shared.columnFilter.filtered', { label })
              : t('shared.columnFilter.filterBy', { label })
          }
            className={cn(
              'shrink-0 normal-case',
              isActive && 'bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary',
            )}
          />
        }
      >
        {isActive ? <ListFilter aria-hidden /> : <ChevronDown aria-hidden />}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="max-h-96 w-64 font-normal tracking-normal normal-case">
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-popover px-2 py-1.5">
          <Search aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            ref={(node) => {
              // The menu takes focus for itself as it opens; ask for it back after.
              if (node) requestAnimationFrame(() => node.focus())
            }}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape' || event.key === 'ArrowDown' || event.key === 'Tab') return
              // Anything else is typing, and must not reach the menu's type-ahead.
              event.stopPropagation()
              if (event.key === 'Enter' && !nothingToApply) {
                event.preventDefault()
                onApply(pending)
              }
            }}
            aria-label={t('shared.columnFilter.search', { label })}
            placeholder={t('shared.columnFilter.searchPlaceholder')}
            className="h-6 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <DropdownMenuCheckboxItem
          checked={needle ? visible.length > 0 && allVisibleChecked : draft === null}
          onCheckedChange={toggleAll}
          disabled={visible.length === 0}
          className="font-medium"
        >
          {needle ? t('shared.columnFilter.selectAllResults') : t('shared.columnFilter.selectAll')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />

        {isLoading ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            {t('shared.columnFilter.loadingValues')}
          </p>
        ) : errorMessage ? (
          <p className="px-2 py-3 text-xs text-destructive">{errorMessage}</p>
        ) : values.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            {t('shared.columnFilter.noValues')}
          </p>
        ) : visible.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            {t('shared.columnFilter.noMatches')}
          </p>
        ) : (
          visible.map((entry) => (
            <DropdownMenuCheckboxItem
              key={keyOf(entry.value)}
              checked={isChecked(entry.value)}
              onCheckedChange={() => toggle(entry.value)}
            >
              <span
                className={cn('min-w-0 flex-1 truncate', entry.value === null && 'text-muted-foreground italic')}
                title={labelOf(entry.value)}
              >
                {labelOf(entry.value)}
              </span>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {format.number(entry.count)}
              </span>
            </DropdownMenuCheckboxItem>
          ))
        )}
        {data?.truncated && (
          <p className="px-2 py-1.5 text-[11px] text-tone-amber">
            {t('shared.columnFilter.truncated', { count: format.number(values.length) })}
          </p>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={nothingToApply}
          onClick={() => onApply(pending)}
          className="justify-center font-medium text-primary"
        >
          {t('shared.columnFilter.apply')}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!isActive} onClick={() => onApply(null)} className="justify-center">
          {t('shared.columnFilter.clearFilter')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
