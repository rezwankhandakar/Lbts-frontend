import { AccountsShell } from '@/features/accounts/components/accounts-shell'
import { WalletSettings } from '@/features/accounts/components/wallet-settings'
import { canWriteAccounts } from '@/features/accounts/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useT } from '@/lib/i18n'

/** The wallets money is kept in: cash for every transaction, a bank or bKash for Walton payments. */
export function AccountsWalletsPage() {
  const t = useT()

  const canWrite = canWriteAccounts(useCurrentRole())

  return (
    <AccountsShell
      title={t('accounts.pages.wallets.title')}
      description={t('accounts.pages.wallets.description')}
    >
      <div className="max-w-4xl">
        <WalletSettings canWrite={canWrite} />
      </div>
    </AccountsShell>
  )
}
