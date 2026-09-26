import { useState } from 'react'
import { ChevronDown, ListFilter } from 'lucide-react'
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
 * a tick box beside each. Nothing is typed. The ticks are a draft until Apply,
 * so ticking ten customers is one request, not ten.
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
  const isActive = Boolean(applied && applied.length > 0)
  const values = data?.values ?? []

  const isChecked = (value: ColumnFilterValue) =>
    draft === null || draft.some((ticked) => keyOf(ticked) === keyOf(value))

  const toggle = (value: ColumnFilterValue) => {
    const current = draft ?? values.map((entry) => entry.value)
    const next = isChecked(value)
      ? current.filter((ticked) => keyOf(ticked) !== keyOf(value))
      : [...current, value]
    const everything = values.every((entry) => next.some((ticked) => keyOf(ticked) === keyOf(entry.value)))
    setDraft(everything && next.length === values.length ? null : next)
  }

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraft(isActive && applied ? applied : null)
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
            aria-label={isActive ? `${label}: filtered` : `Filter ${label}`}
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
        <DropdownMenuCheckboxItem
          checked={draft === null}
          onCheckedChange={() => setDraft(draft === null ? [] : null)}
          className="font-medium"
        >
          {t('shared.columnFilter.selectAll')}
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
        ) : (
          values.map((entry) => (
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
          disabled={draft !== null && draft.length === 0}
          onClick={() => onApply(draft)}
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
