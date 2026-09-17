import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useWallets } from '../hooks/use-accounts'
import type { EntryFilterPatch } from '../hooks/use-entry-list-params'
import { KIND_META } from '../lib/accounts-meta'
import { ENTRY_KINDS } from '../types'
import type { EntryKindFilter, EntryListParams } from '../types'

interface CashBookToolbarProps {
  params: EntryListParams
  onChange: (patch: EntryFilterPatch) => void
  onReset: () => void
  isFiltered: boolean
  /** Hide the kind controls on a page that fixes the kind. */
  showKind?: boolean
}

const DIRECTIONS: { value: EntryKindFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in', label: 'Money in' },
  { value: 'out', label: 'Money out' },
]

const ANY = 'any'

/** Search, direction, kind, wallet and a date range — every one applied server-side. */
export function CashBookToolbar({ params, onChange, onReset, isFiltered, showKind = true }: CashBookToolbarProps) {
  const wallets = useWallets()
  const isKind = (ENTRY_KINDS as readonly string[]).includes(params.kind)

  return (
    <div className="flex flex-col gap-3 border-b bg-muted/20 p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={params.search}
            onChange={(event) => onChange({ search: event.target.value })}
            aria-label="Search by number, person, vendor, trip, reference or note"
            className="pl-8.5"
          />
        </div>

        {showKind && (
          <div role="radiogroup" aria-label="Direction" className="inline-flex w-fit rounded-lg border bg-card p-0.5">
            {DIRECTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={params.kind === option.value}
                onClick={() => onChange({ kind: option.value })}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition',
                  params.kind === option.value ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          {showKind && (
            <Select value={isKind ? params.kind : ANY} onValueChange={(value) => onChange({ kind: value === ANY || !value ? 'all' : (value as EntryKindFilter) })}>
              <SelectTrigger className="h-8 w-[10.5rem]" aria-label="Entry type">
                <SelectValue>{(value: string) => (value === ANY ? 'Any type' : KIND_META[value as keyof typeof KIND_META].label)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={ANY}>Any type</SelectItem>
                  {ENTRY_KINDS.filter((kind) => kind !== 'AdvanceAdjust').map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {KIND_META[kind].label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}

          <Select value={params.walletId || ANY} onValueChange={(value) => onChange({ walletId: value === ANY || !value ? '' : String(value) })}>
            <SelectTrigger className="h-8 w-[10.5rem]" aria-label="Wallet">
              <SelectValue>
                {(value: string) => (value === ANY ? 'Every wallet' : (wallets.data?.find((wallet) => wallet.id === value)?.name ?? 'Wallet'))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={ANY}>Every wallet</SelectItem>
                {wallets.data?.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5">
            <Input type="date" value={params.from} max={params.to || undefined} onChange={(event) => onChange({ from: event.target.value })} aria-label="From date" className="h-8 w-[9.5rem]" />
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="date" value={params.to} min={params.from || undefined} onChange={(event) => onChange({ to: event.target.value })} aria-label="To date" className="h-8 w-[9.5rem]" />
          </div>

          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
              <X data-icon="inline-start" aria-hidden />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
