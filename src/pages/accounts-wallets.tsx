import { AccountsShell } from '@/features/accounts/components/accounts-shell'
import { WalletSettings } from '@/features/accounts/components/wallet-settings'
import { canWriteAccounts } from '@/features/accounts/types'
import { useCurrentRole } from '@/hooks/use-current-role'

/** The wallets money is kept in: cash for every transaction, a bank or bKash for Walton payments. */
export function AccountsWalletsPage() {
  const canWrite = canWriteAccounts(useCurrentRole())

  return (
    <AccountsShell title="Wallets" description="The wallets money is kept in.">
      <div className="max-w-4xl">
        <WalletSettings canWrite={canWrite} />
      </div>
    </AccountsShell>
  )
}
