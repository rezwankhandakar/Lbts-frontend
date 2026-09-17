import { Archive, ArchiveRestore, Landmark, MoreHorizontal, Pencil, Plus, Smartphone, Trash2, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/features/vendor/components/confirm-dialog'
import { cn } from '@/lib/utils'
import { useWallets } from '../hooks/use-accounts'
import { useDeleteWallet, useSaveWallet } from '../hooks/use-accounts-mutations'
import { WALLET_KIND_LABEL, formatDay, signedTaka, taka } from '../lib/accounts-meta'
import type { WalletKind, WalletRecord } from '../types'
import { Panel } from './account-atoms'
import { WalletDialog } from './wallet-dialog'

const ICONS: Record<WalletKind, typeof Wallet> = { Cash: Wallet, Bank: Landmark, 'Mobile Banking': Smartphone }

/** Every wallet with its balance. Closing keeps the history; deleting is offered for one never used. */
export function WalletSettings({ canWrite }: { canWrite: boolean }) {
  const wallets = useWallets()
  const save = useSaveWallet()
  const remove = useDeleteWallet()
  const [editing, setEditing] = useState<WalletRecord | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<WalletRecord | null>(null)

  return (
    <Panel
      title="Wallets"
      description="Every transaction runs through cash. Bank and mobile wallets only receive Walton bill payments."
      action={
        canWrite && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus data-icon="inline-start" aria-hidden />
            Add wallet
          </Button>
        )
      }
    >
      {wallets.isPending ? (
        <Skeleton className="m-4 h-32" />
      ) : (
        <ul className="grid gap-3 p-4 sm:grid-cols-2">
          {(wallets.data ?? []).map((wallet) => {
            const Icon = ICONS[wallet.kind]
            return (
              <li key={wallet.id} className={cn('rounded-xl border p-3.5', !wallet.isActive && 'bg-muted/30 opacity-75')}>
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link to={`/accounts/cash-book?wallet=${wallet.id}`} className="block truncate text-sm font-medium hover:text-primary">
                      {wallet.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {WALLET_KIND_LABEL[wallet.kind]}
                      {wallet.kind !== 'Cash' && ' · Walton payments only'}
                      {wallet.accountNumber && ` · ${wallet.accountNumber}`}
                      {!wallet.isActive && ' · Closed'}
                    </p>
                  </div>
                  {canWrite && (
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${wallet.name}`} />}>
                        <MoreHorizontal aria-hidden />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-40">
                        <DropdownMenuItem onClick={() => setEditing(wallet)}>
                          <Pencil aria-hidden />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => save.mutate({ id: wallet.id, input: { isActive: !wallet.isActive } })}>
                          {wallet.isActive ? <Archive aria-hidden /> : <ArchiveRestore aria-hidden />}
                          {wallet.isActive ? 'Close wallet' : 'Reopen wallet'}
                        </DropdownMenuItem>
                        {wallet.entryCount === 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(wallet)}>
                              <Trash2 aria-hidden />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">{signedTaka(wallet.balance)}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  In {taka(wallet.moneyIn)} · Out {taka(wallet.moneyOut)} · {wallet.entryCount} entries
                  {wallet.lastEntryDate && ` · last ${formatDay(wallet.lastEntryDate)}`}
                </p>
              </li>
            )
          })}
        </ul>
      )}

      <WalletDialog
        open={creating || editing !== null}
        wallet={editing}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false)
            setEditing(null)
          }
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        isPending={remove.isPending}
        title={`Delete ${deleting?.name ?? 'wallet'}?`}
        description="Nothing was ever recorded against it, so it is removed outright."
        confirmLabel="Delete wallet"
        pendingLabel="Deleting…"
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </Panel>
  )
}
