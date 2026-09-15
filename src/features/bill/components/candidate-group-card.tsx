import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatTripDate } from '@/features/gate-pass/lib/gate-pass-meta'
import { formatTaka } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useUpdateBill } from '../hooks/use-bill-mutations'
import type { CandidateSelection } from '../hooks/use-candidate-selection'
import type { BillCandidateGroup, BillRecord } from '../types'
import { CandidateRowItem } from './candidate-row-item'

interface CandidateGroupCardProps {
  group: BillCandidateGroup
  bill: BillRecord
  selection: CandidateSelection
  isAdding: boolean
  onAddRows: (rowIds: string[]) => void
}

/**
 * Why a Trip DO of another unit cannot be added, said out loud — and, while the
 * bill is still empty, the fix in one press: a bill opened under the wrong unit
 * is the ordinary cause.
 */
function UnitMismatchNotice({ group, bill }: { group: BillCandidateGroup; bill: BillRecord }) {
  const update = useUpdateBill()
  const canSwitch = bill.lineCount === 0 && Boolean(group.unit)

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-tone-amber/30 bg-tone-amber/10 px-3.5 py-2 text-[12px]">
      <p className="min-w-0 flex-1">
        This Trip DO&apos;s gate pass is unit <span className="font-mono font-semibold">{group.unit || '(blank)'}</span>, and
        this bill is for unit <span className="font-mono font-semibold">{bill.unit}</span>.{' '}
        {canSwitch
          ? 'Switch the bill to this unit to add it.'
          : 'Add it to a bill for its own unit, or correct the unit on its gate pass.'}
      </p>
      {canSwitch && (
        <Button
          size="xs"
          variant="outline"
          disabled={update.isPending}
          onClick={() => update.mutate({ id: bill.id, input: { unit: group.unit } })}
        >
          {update.isPending && <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />}
          Switch bill to {group.unit}
        </Button>
      )}
    </div>
  )
}

/**
 * One Trip DO and every sheet row carrying it: the unit of work a bill is built
 * in. The header ticks or adds the whole Trip DO in one press; the rows beneath
 * can be ticked apart, for the day a return belongs on next month's bill.
 */
export function CandidateGroupCard({ group, bill, selection, isAdding, onAddRows }: CandidateGroupCardProps) {
  const billUnit = bill.unit
  const addable = new Set(group.addableRowIds)
  const addableRows = group.rows.filter((row) => addable.has(row.id))
  const ticked = addableRows.filter((row) => selection.isSelected(row.id)).length
  const allTicked = addableRows.length > 0 && ticked === addableRows.length

  return (
    <article
      className={cn(
        'overflow-hidden rounded-xl border bg-card shadow-xs transition',
        ticked > 0 && 'border-primary/40 ring-2 ring-primary/10',
      )}
    >
      <header className="flex flex-wrap items-center gap-3 border-b bg-muted/25 px-3.5 py-2.5">
        <Checkbox
          checked={allTicked}
          indeterminate={ticked > 0 && !allTicked}
          disabled={addableRows.length === 0}
          onCheckedChange={() => selection.setRows(addableRows, !allTicked)}
          aria-label={`Tick every row of Trip DO ${group.tripDo}`}
        />

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-[15px] font-semibold tracking-tight">{group.tripDo}</span>
            <span className="text-xs text-muted-foreground">{formatTripDate(group.tripDate)}</span>
            <span className="rounded-md border bg-background px-1.5 py-px font-mono text-[10.5px]">
              {group.csd || 'No CSD'}
            </span>
            <span
              className={cn(
                'rounded-md border px-1.5 py-px font-mono text-[10.5px] font-semibold',
                group.unitMatches
                  ? 'bg-background'
                  : 'border-tone-rose/30 bg-tone-rose/10 text-tone-rose',
              )}
              title={group.unitMatches ? undefined : `This bill is for unit ${billUnit}`}
            >
              {group.unit || 'No unit'}
            </span>
          </p>
          <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
            {group.gatePassNumbers.join(', ')} · {group.rows.length} {group.rows.length === 1 ? 'row' : 'rows'} ·{' '}
            {group.qty} pcs · {formatTaka(group.amount)}
          </p>
        </div>

        {addableRows.length > 0 ? (
          <Button size="sm" variant="secondary" disabled={isAdding} onClick={() => onAddRows(group.addableRowIds)}>
            <Plus data-icon="inline-start" aria-hidden />
            Add {addableRows.length === group.rows.length ? 'Trip DO' : `${addableRows.length} rows`}
          </Button>
        ) : (
          <span className="text-[11.5px] font-medium text-muted-foreground">
            {!group.unitMatches
              ? `Unit ${group.unit || '(blank)'} · not ${billUnit}`
              : group.onThisBill === group.rows.length
                ? 'Already on this bill'
                : `Billed on ${group.otherBills.join(', ')}`}
          </span>
        )}
      </header>

      {!group.unitMatches && <UnitMismatchNotice group={group} bill={bill} />}

      <ul className="divide-y">
        {group.rows.map((row) => (
          <CandidateRowItem
            key={row.id}
            row={row}
            billId={bill.id}
            addable={addable.has(row.id)}
            blockedByUnit={!group.unitMatches}
            selected={selection.isSelected(row.id)}
            onToggle={selection.toggle}
          />
        ))}
      </ul>
    </article>
  )
}
