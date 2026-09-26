import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useWallets } from '../hooks/use-accounts'
import type { EntryFilterPatch } from '../hooks/use-entry-list-params'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import type { EntryKind } from '../types'
import { kindMeta } from '../lib/accounts-meta'
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

const DIRECTIONS: { value: EntryKindFilter; labelKey: TranslationKey }[] = [
  { value: 'all', labelKey: 'accounts.filters.anyDirection' },
  { value: 'in', labelKey: 'accounts.filters.moneyIn' },
  { value: 'out', labelKey: 'accounts.filters.moneyOut' },
]

const ANY = 'any'

/** Search, direction, kind, wallet and a date range — every one applied server-side. */
export function CashBookToolbar({ params, onChange, onReset, isFiltered, showKind = true }: CashBookToolbarProps) {
  const t = useT()

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
            aria-label={t('accounts.filters.searchAria')}
            className="pl-8.5"
          />
        </div>

        {showKind && (
          <div role="radiogroup" aria-label={t('accounts.filters.directionAria')} className="grid grid-cols-3 rounded-lg border bg-card p-0.5 sm:inline-flex sm:w-fit">
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
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        )}

        {/* Two controls to a row on a phone, a wrapping row from sm up. */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center lg:ml-auto">
          {showKind && (
            <Select value={isKind ? params.kind : ANY} onValueChange={(value) => onChange({ kind: value === ANY || !value ? 'all' : (value as EntryKindFilter) })}>
              <SelectTrigger className="h-8 w-full sm:w-[10.5rem]" aria-label={t('accounts.filters.kindAria')}>
                <SelectValue>
                  {(value: string) =>
                    value === ANY
                      ? t('accounts.filters.anyKind')
                      : kindMeta(value as EntryKind, t).label
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={ANY}>{t('accounts.filters.anyKind')}</SelectItem>
                  {ENTRY_KINDS.filter((kind) => kind !== 'AdvanceAdjust').map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {kindMeta(kind, t).label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}

          <Select value={params.walletId || ANY} onValueChange={(value) => onChange({ walletId: value === ANY || !value ? '' : String(value) })}>
            <SelectTrigger className={cn('h-8 w-full sm:w-[10.5rem]', !showKind && 'col-span-2 sm:col-auto')} aria-label={t('accounts.filters.walletAria')}>
              <SelectValue>
                {(value: string) =>
                  value === ANY
                    ? t('accounts.filters.everyWallet')
                    : (wallets.data?.find((wallet) => wallet.id === value)?.name ??
                      t('accounts.filters.wallet'))
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={ANY}>{t('accounts.filters.everyWallet')}</SelectItem>
                {wallets.data?.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* The dates take the whole row on a phone: two fixed boxes side by side overflow a 360px screen, and half a date is not a date. */}
          <div className="col-span-2 flex min-w-0 items-center gap-1.5 sm:col-auto">
            <Input type="date" value={params.from} max={params.to || undefined} onChange={(event) => onChange({ from: event.target.value })} aria-label={t('accounts.filters.fromDate')} className="h-8 w-full min-w-0 sm:w-[9.5rem]" />
            <span className="shrink-0 text-xs text-muted-foreground">to</span>
            <Input type="date" value={params.to} min={params.from || undefined} onChange={(event) => onChange({ to: event.target.value })} aria-label={t('accounts.filters.toDate')} className="h-8 w-full min-w-0 sm:w-[9.5rem]" />
          </div>

          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={onReset} className="col-span-2 text-muted-foreground sm:col-auto">
              <X data-icon="inline-start" aria-hidden />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
