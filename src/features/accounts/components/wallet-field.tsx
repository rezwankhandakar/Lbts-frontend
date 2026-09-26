import { TriangleAlert } from 'lucide-react'
import { useEffect } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useWallets } from '../hooks/use-accounts'
import { taka, walletKindLabel } from '../lib/accounts-meta'
import type { WalletKind } from '../types'
import { EntryField } from './entry-field'
import { useT } from '@/lib/i18n'

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
  /**
   * The kind to choose first when nothing has been chosen yet — a Walton labour
   * payment lands in the bank. A **default and not a restriction**: every other
   * wallet stays in the list, because a payment that came in cash is an
   * ordinary thing that must still be recordable.
   */
  preferKind?: WalletKind
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
  preferKind,
  onChange,
}: WalletFieldProps) {
  const t = useT()

  const wallets = useWallets()
  const options = (wallets.data ?? []).filter(
    (wallet) => (wallet.isActive || wallet.id === value) && wallet.id !== exclude && (!cashOnly || wallet.kind === 'Cash'),
  )
  const selected = options.find((wallet) => wallet.id === value)
  const after = selected ? selected.balance + ownAmount - outgoing : null

  /**
   * What an empty field fills itself with: the only cash wallet there is, or
   * the first wallet of the preferred kind. Either way it is chosen once, on a
   * blank field, so a deliberate change is never undone.
   */
  const suggested =
    (cashOnly && options.length === 1 ? options[0].id : null) ??
    (preferKind ? (options.find((wallet) => wallet.kind === preferKind)?.id ?? null) : null)

  useEffect(() => {
    if (suggested && !value) {
      onChange(suggested)
    }
  }, [suggested, value, onChange])

  const hint =
    selected && after !== null && after < 0 && outgoing > 0 ? (
      <span className="flex items-center gap-1.5 text-tone-amber">
        <TriangleAlert className="size-3.5" aria-hidden />
        {selected.name} holds {taka(selected.balance + ownAmount)} — this takes it to {taka(after)}.
      </span>
    ) : selected ? (
      cashOnly
        ? t('accounts.wallet.cashBalance', { amount: taka(selected.balance) })
        : t('accounts.wallet.balance', { amount: taka(selected.balance) })
    ) : wallets.isPending ? (
      t('accounts.wallet.loading')
    ) : cashOnly && options.length === 0 ? (
      <span className="text-tone-amber">{t('accounts.wallet.noCashWallet')}</span>
    ) : cashOnly ? (
      t('accounts.wallet.cashOnly')
    ) : undefined

  return (
    <EntryField id={id} label={label} error={error} hint={hint}>
      <Select value={value || null} onValueChange={(next) => onChange(String(next ?? ''))}>
        <SelectTrigger id={id} className="h-9 w-full" aria-invalid={Boolean(error)}>
          <SelectValue>
            {(current: string | null) => {
              const wallet = wallets.data?.find((option) => option.id === current)
              return wallet ? wallet.name : <span className="text-muted-foreground">{cashOnly ? t('accounts.wallet.chooseCash') : t('accounts.wallet.choose')}</span>
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
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {walletKindLabel(wallet.kind, t)}
                    </span>
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
