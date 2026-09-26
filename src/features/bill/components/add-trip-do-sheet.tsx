import { Loader2, PackagePlus, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { formatTaka } from '@/lib/format'
import { useAddBillLines } from '../hooks/use-bill-mutations'
import { useBillCandidates } from '../hooks/use-bills'
import { useCandidateSelection } from '../hooks/use-candidate-selection'
import type { BillRecord } from '../types'
import { CandidateResults } from './candidate-results'
import { useT } from '@/lib/i18n'

interface AddTripDoSheetProps {
  bill: BillRecord
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Building a bill off a stack of gate passes: type a Trip DO, press Enter, and
 * the whole Trip DO is on the bill — then the next. It stays open between
 * additions for exactly that reason. With nothing typed it offers the bill's
 * own unit and month, not yet billed, which is the list a month-end bill is
 * made from.
 */
export function AddTripDoSheet({ bill, open, onOpenChange }: AddTripDoSheetProps) {
  const t = useT()

  const [search, setSearch] = useState('')
  const settled = useDebouncedValue(search.trim(), 300)
  const candidates = useBillCandidates(bill.id, settled, open)
  const selection = useCandidateSelection()
  const add = useAddBillLines()

  const groups = candidates.data?.groups ?? []

  const addRows = (rowIds: string[]) => {
    if (rowIds.length === 0 || add.isPending) {
      return
    }
    add.mutate(
      { id: bill.id, rowIds },
      {
        onSuccess: () => {
          selection.setRows(
            groups.flatMap((group) => group.rows).filter((row) => rowIds.includes(row.id)),
            false,
          )
        },
      },
    )
  }

  // Enter adds the whole Trip DO when the search has found exactly one.
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    const only = settled === search.trim() && groups.length === 1 ? groups[0] : null
    if (only && only.addableRowIds.length > 0) {
      addRows(only.addableRowIds)
      setSearch('')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="border-b px-5 pt-5 pb-4">
          <SheetTitle className="flex items-center gap-2 pr-10">
            <PackagePlus className="size-4.5 text-primary" aria-hidden />
            {t('bill.addTripDo')}
          </SheetTitle>
          <SheetDescription>
            To <span className="font-mono text-foreground">{bill.billNumber}</span> · Unit {bill.unit} ·{' '}
            {bill.periodLabel}
          </SheetDescription>

          <div className="relative mt-3">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              autoFocus
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={onKeyDown}
              aria-label={t('bill.toolbar.tripDoAria')}
              className="h-10 pl-9 font-mono text-[15px]"
            />
            {candidates.isFetching && (
              <Loader2
                className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                aria-hidden
              />
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {settled
              ? t('bill.search.enterHint')
              : t('bill.search.hint', { unit: bill.unit, period: bill.periodLabel })}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-muted/30 px-5 py-4">
          <CandidateResults
            bill={bill}
            data={candidates.data}
            isLoading={candidates.isPending}
            errorMessage={candidates.isError ? candidates.error.message : null}
            searched={settled}
            selection={selection}
            isAdding={add.isPending}
            onAddRows={addRows}
          />
        </div>

        <SheetFooter className="flex-row items-center justify-between gap-3 border-t bg-card px-5 py-3">
          <p className="text-sm" aria-live="polite">
            <span className="font-semibold tabular-nums">{selection.count}</span>{' '}
            {selection.count === 1 ? 'row' : 'rows'} ticked
            <span className="text-muted-foreground">
              {' '}
              · {selection.qty} pcs · {formatTaka(selection.amount)}
            </span>
          </p>
          <div className="flex items-center gap-2">
            {selection.count > 0 && (
              <Button variant="ghost" size="sm" onClick={selection.clear} disabled={add.isPending}>
                {t('common.actions.clear')}
              </Button>
            )}
            <Button disabled={selection.count === 0 || add.isPending} onClick={() => addRows(selection.ids)}>
              {add.isPending ? (
                <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />
              ) : (
                <Plus data-icon="inline-start" aria-hidden />
              )}
              Add to bill
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
