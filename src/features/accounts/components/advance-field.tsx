import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAdvances } from '../hooks/use-accounts'
import { formatDay, taka } from '../lib/accounts-meta'
import { EntryField, LockedValue } from './entry-field'
import type { KindFieldsProps } from './entry-kind-fields'

/**
 * The advance a cash return settles. Only advances with something
 * outstanding are offered; the one a correction already points at is kept in
 * the list even once it is fully settled.
 */
export function AdvanceField({ draft, set, errors, request }: KindFieldsProps) {
  const locked = request.locked?.includes('advanceId')
  const advances = useAdvances({ page: 1, limit: 50, status: 'outstanding', search: '' })
  const options = advances.data?.records ?? []
  const current = request.entry?.advance
  const selected = options.find((advance) => advance.id === draft.advanceId)
  const ownAmount = request.entry && current?.id === draft.advanceId ? request.entry.amount : 0
  const left = selected ? selected.outstanding + ownAmount : null

  const hint =
    selected && left !== null ? (
      <span className="flex flex-wrap items-center gap-x-2">
        {taka(left)} outstanding of {taka(selected.amount)}
        <button type="button" className="font-medium text-primary hover:underline" onClick={() => set({ amount: left })}>
          Settle all of it
        </button>
      </span>
    ) : undefined

  if (locked && selected) {
    return (
      <div className="grid gap-1.5">
        <LockedValue
          label="Advance"
          value={`${selected.party} · ${selected.entryNumber}`}
          detail={`Given ${formatDay(selected.date)}${selected.purpose ? ` for ${selected.purpose}` : ''}`}
        />
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
    )
  }

  return (
    <EntryField id="entry-advance" label="Advance" error={errors.advanceId} hint={hint}>
      <Select value={draft.advanceId || null} onValueChange={(next) => set({ advanceId: String(next ?? '') })}>
        <SelectTrigger id="entry-advance" className="h-9 w-full" aria-invalid={Boolean(errors.advanceId)}>
          <SelectValue>
            {(value: string | null) => {
              const advance = options.find((option) => option.id === value)
              if (advance) return `${advance.party} · ${advance.entryNumber}`
              if (current && current.id === value) return current.entryNumber
              return <span className="text-muted-foreground">{advances.isPending ? 'Loading…' : 'Choose an advance'}</span>
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {current && !options.some((option) => option.id === current.id) && (
              <SelectItem value={current.id}>{current.entryNumber}</SelectItem>
            )}
            {options.map((advance) => (
              <SelectItem key={advance.id} value={advance.id}>
                <span className="flex flex-1 items-center justify-between gap-4">
                  <span className="truncate">
                    {advance.party}
                    <span className="ml-1.5 text-xs text-muted-foreground">{formatDay(advance.date)}</span>
                  </span>
                  <span className="text-xs tabular-nums">{taka(advance.outstanding)}</span>
                </span>
              </SelectItem>
            ))}
            {options.length === 0 && !current && (
              <div className="px-2 py-3 text-xs text-muted-foreground">No advance is outstanding.</div>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </EntryField>
  )
}
