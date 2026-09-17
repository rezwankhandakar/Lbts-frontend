import { TriangleAlert } from 'lucide-react'
import { useEffect } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useWallets } from '../hooks/use-accounts'
import { WALLET_KIND_LABEL, taka } from '../lib/accounts-meta'
import { EntryField } from './entry-field'

interface WalletFieldProps {
  id: string
  label: string
  value: string
  error?: string
  /** What this entry takes out of the wallet, to warn before a balance goes below zero. */
  outgoing?: number
  /** The amount a correction already took out of this wallet, which is not taken twice. */
  ownAmount?: number
  /** A wallet that cannot be chosen — a transfer's other side. */
  exclude?: string
  /** Deposits go into cash, and vendor payments, advances and expenses leave from it, and nothing else. */
  cashOnly?: boolean
  onChange: (walletId: string) => void
}

/**
 * Choosing a wallet, with its balance beside it. A balance going below zero
 * is warned about rather than refused: entries are often typed out of order,
 * and the deposit that covers it may simply not be recorded yet.
 *
 * For a kind that uses cash only, the list holds cash wallets alone — the
 * server refuses anything else — and a single cash wallet is chosen for you.
 */
export function WalletField({
  id,
  label,
  value,
  error,
  outgoing = 0,
  ownAmount = 0,
  exclude,
  cashOnly = false,
  onChange,
}: WalletFieldProps) {
  const wallets = useWallets()
  const options = (wallets.data ?? []).filter(
    (wallet) => (wallet.isActive || wallet.id === value) && wallet.id !== exclude && (!cashOnly || wallet.kind === 'Cash'),
  )
  const selected = options.find((wallet) => wallet.id === value)
  const after = selected ? selected.balance + ownAmount - outgoing : null
  const onlyOption = cashOnly && options.length === 1 ? options[0].id : null

  useEffect(() => {
    if (onlyOption && !value) {
      onChange(onlyOption)
    }
  }, [onlyOption, value, onChange])

  const hint =
    selected && after !== null && after < 0 && outgoing > 0 ? (
      <span className="flex items-center gap-1.5 text-tone-amber">
        <TriangleAlert className="size-3.5" aria-hidden />
        {selected.name} holds {taka(selected.balance + ownAmount)} — this takes it to {taka(after)}.
      </span>
    ) : selected ? (
      `${cashOnly ? 'Cash balance' : 'Balance'} ${taka(selected.balance)}`
    ) : wallets.isPending ? (
      'Loading wallets…'
    ) : cashOnly && options.length === 0 ? (
      <span className="text-tone-amber">No cash wallet is open. Add one on the Wallets tab.</span>
    ) : cashOnly ? (
      'Cash wallets only.'
    ) : undefined

  return (
    <EntryField id={id} label={label} error={error} hint={hint}>
      <Select value={value || null} onValueChange={(next) => onChange(String(next ?? ''))}>
        <SelectTrigger id={id} className="h-9 w-full" aria-invalid={Boolean(error)}>
          <SelectValue>
            {(current: string | null) => {
              const wallet = wallets.data?.find((option) => option.id === current)
              return wallet ? wallet.name : <span className="text-muted-foreground">{cashOnly ? 'Choose a cash wallet' : 'Choose a wallet'}</span>
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((wallet) => (
              <SelectItem key={wallet.id} value={wallet.id}>
                <span className="flex min-w-0 flex-1 items-center justify-between gap-4">
                  <span className="truncate">
                    {wallet.name}
                    <span className="ml-1.5 text-xs text-muted-foreground">{WALLET_KIND_LABEL[wallet.kind]}</span>
                  </span>
                  <span className="text-xs font-medium tabular-nums">{taka(wallet.balance)}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </EntryField>
  )
}
