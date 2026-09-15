import { useState } from 'react'
import { Package, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useGatePassOptions } from '../hooks/use-trip-do'
import { defaultLinkQty } from '../lib/split-parts'
import type { GatePassOption, LinkTarget } from '../types'
import { GatePassOptionList } from './gate-pass-option-list'
import { LinkQtyField } from './link-qty-field'

interface AssignTripDoDialogProps {
  target: LinkTarget | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (option: GatePassOption, qty: number) => void
}

/**
 * Setting a Trip DO: choose the gate pass line the goods came out on, and —
 * when only part of the row did — how many.
 *
 * Nothing is typed into a CSD, unit or Trip DO box. The picker offers filed
 * gate passes whose model or customer is the row's or close to it, says which
 * is which, and everything a row shows about its Trip DO is read off the one
 * chosen.
 */
export function AssignTripDoDialog({
  target,
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: AssignTripDoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {/* Keyed on the rows, so a second row never opens holding the first
            one's search, choice or quantity. */}
        {target && (
          <AssignTripDoBody
            key={target.rowIds.join(',')}
            target={target}
            isPending={isPending}
            onCancel={() => onOpenChange(false)}
            onConfirm={onConfirm}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function blockedReason(target: LinkTarget, chosen: GatePassOption | null, qty: number): string | null {
  if (!chosen) {
    return 'Choose the gate pass these goods came out on.'
  }
  if (qty < 1) {
    return 'Link at least one piece.'
  }
  if (qty > chosen.remainingQty) {
    return `Only ${chosen.remainingQty} ${chosen.model} left on this gate pass.`
  }
  if (chosen.isCurrent && qty === target.qty) {
    return 'This is already the Trip DO.'
  }
  return null
}

function AssignTripDoBody({
  target,
  isPending,
  onCancel,
  onConfirm,
}: {
  target: LinkTarget
  isPending: boolean
  onCancel: () => void
  onConfirm: (option: GatePassOption, qty: number) => void
}) {
  const [query, setQuery] = useState('')
  const [chosenKey, setChosenKey] = useState<string | null>(null)
  const [qty, setQty] = useState(target.qty)
  const settled = useDebouncedValue(query.trim(), 250)

  const options = useGatePassOptions(target.anchorRowId, settled)
  const list = options.data ?? []
  // Until somebody chooses, the line the row is already linked to is chosen.
  const chosen =
    list.find((option) => (chosenKey === null ? option.isCurrent : option.optionKey === chosenKey)) ?? null
  const blocked = blockedReason(target, chosen, qty)

  const choose = (option: GatePassOption) => {
    setChosenKey(option.optionKey)
    setQty(target.canSplit ? Math.max(1, defaultLinkQty(target.qty, option.remainingQty)) : target.qty)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{target.currentGatePassId ? 'Change Trip DO' : 'Set Trip DO'}</DialogTitle>
        <DialogDescription>
          Choose the gate pass these goods came out on. Its CSD and unit are set on the row with it.
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-3.5 py-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Package className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">{target.productName}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {target.model || 'No model'} · {target.label}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl leading-none font-semibold tabular-nums">{target.qty}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">pcs</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Trip DO, gate pass number or vehicle"
            aria-label="Find a gate pass"
            className="pl-8.5"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {settled
            ? `Filed gate passes matching “${settled}”, even where the model or customer is written differently.`
            : `Recent filed gate passes with ${target.model || 'this product'}, or a close model or customer, still to link.`}
        </p>
        <GatePassOptionList
          options={list}
          isLoading={options.isPending}
          errorMessage={options.error?.message ?? null}
          chosenKey={chosen?.optionKey ?? null}
          model={target.model}
          onChoose={choose}
        />
      </div>

      {chosen && target.canSplit && (
        <LinkQtyField
          qty={qty}
          onChange={setQty}
          rowQty={target.qty}
          room={chosen.remainingQty}
          tripDo={chosen.tripDo}
        />
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button
          onClick={() => chosen && onConfirm(chosen, qty)}
          disabled={Boolean(blocked) || isPending}
          title={blocked ?? undefined}
        >
          {isPending ? 'Saving…' : chosen ? `Set Trip DO ${chosen.tripDo}` : 'Set Trip DO'}
        </Button>
      </DialogFooter>
    </>
  )
}
