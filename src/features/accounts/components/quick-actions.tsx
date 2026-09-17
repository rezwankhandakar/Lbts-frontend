import { cn } from '@/lib/utils'
import { useWallets } from '../hooks/use-accounts'
import { useEntryDialog } from '../hooks/use-entry-dialog'
import { KIND_META } from '../lib/accounts-meta'
import type { EntryKind } from '../types'

const ACTIONS: EntryKind[] = ['Deposit', 'Expense', 'VendorPayment', 'TripAdvance', 'Advance', 'Transfer']

/**
 * The things somebody keeping the books does most, one press each. Transfer
 * is offered only while there are two cash wallets to move money between —
 * nothing moves into or out of a bank or mobile wallet.
 */
export function QuickActions({ className }: { className?: string }) {
  const dialog = useEntryDialog()
  const wallets = useWallets()
  const cashWallets = (wallets.data ?? []).filter((wallet) => wallet.kind === 'Cash' && wallet.isActive).length
  const actions = ACTIONS.filter((kind) => kind !== 'Transfer' || cashWallets >= 2)

  return (
    <div className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6', className)}>
      {actions.map((kind) => {
        const meta = KIND_META[kind]
        return (
          <button
            key={kind}
            type="button"
            onClick={() => dialog.open({ kind })}
            className="group flex items-center gap-3 rounded-xl border bg-card px-3 py-3 text-left shadow-xs transition outline-none hover:-translate-y-px hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 transition group-hover:scale-105', meta.chip)}>
              <meta.icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 text-[13px] leading-tight font-medium">{meta.action}</span>
          </button>
        )
      })}
    </div>
  )
}
