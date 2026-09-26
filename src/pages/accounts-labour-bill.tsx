import { ArrowLeft, ExternalLink, HandCoins, HardHat, Wallet } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Panel, StatTile } from '@/features/accounts/components/account-atoms'
import { AccountsShell } from '@/features/accounts/components/accounts-shell'
import { EntryList } from '@/features/accounts/components/entry-list'
import { LabourCsdCard } from '@/features/accounts/components/labour-csd-card'
import { useLabourReceivable } from '@/features/accounts/hooks/use-accounts'
import { taka } from '@/features/accounts/lib/accounts-meta'
import { canWriteAccounts } from '@/features/accounts/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useT } from '@/lib/i18n'

/**
 * One month's labour claim, split into the cards it is actually paid on.
 *
 * Every figure here is read off the labour bill's own sheet rather than stored
 * beside it, so a row corrected on the sheet changes what this page says a CSD
 * is owed — there is no second copy to refresh and nothing that can drift.
 */
export function AccountsLabourBillPage() {
  const t = useT()

  const { id = '' } = useParams()
  const canWrite = canWriteAccounts(useCurrentRole())
  const query = useLabourReceivable(id)

  return (
    <AccountsShell
      title={t('accounts.pages.labourBill.title')}
      description={t('accounts.pages.labourBill.monthDescription')}
      actions={
        <Link to="/accounts/labour-bills" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <ArrowLeft data-icon="inline-start" aria-hidden />
          {t('accounts.pages.labourBill.allMonths')}
        </Link>
      }
    >
      {query.isPending ? (
        <div className="grid gap-5">
          <Skeleton className="h-24 rounded-xl" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-60 rounded-xl" />
            ))}
          </div>
        </div>
      ) : query.isError ? (
        <p className="rounded-xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          {query.error.message}
        </p>
      ) : (
        <LabourBillBody detail={query.data} canWrite={canWrite} />
      )}
    </AccountsShell>
  )
}

function LabourBillBody({
  detail,
  canWrite,
}: {
  detail: NonNullable<ReturnType<typeof useLabourReceivable>['data']>
  canWrite: boolean
}) {
  const t = useT()

  const { month, receipts } = detail
  const payable = month.csds.filter((csd) => csd.canReceive)

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={month.periodLabel}
          value={taka(month.billedAmount)}
          hint={`${month.billNumber} · ${month.status}`}
          icon={HardHat}
          tone="indigo"
        />
        <StatTile
          label={t('accounts.pages.labourBill.received')}
          value={taka(month.receivedAmount)}
          hint={`${receipts.length} ${receipts.length === 1 ? 'payment' : 'payments'}`}
          icon={Wallet}
          tone="emerald"
        />
        <StatTile
          label={t('accounts.pages.labourBill.stillToReceive')}
          value={taka(month.outstanding)}
          hint="Across this month's CSDs"
          icon={HandCoins}
          tone="amber"
        />
        <StatTile
          label={t('accounts.pages.labourBill.openSheet')}
          value={`${payable.length} ${payable.length === 1 ? 'CSD' : 'CSDs'}`}
          hint={t('accounts.pages.labourBill.openSheetHint')}
          icon={ExternalLink}
          tone="violet"
          to={`/labour-bills/${month.id}`}
        />
      </div>

      <section aria-label={t('accounts.pages.labourBill.csdsAria')} className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {month.csds.map((csd) => (
          <LabourCsdCard key={csd.key || 'pending'} month={month} csd={csd} canWrite={canWrite} />
        ))}
      </section>

      {month.csds.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-card px-4 py-16 text-center">
          <HardHat className="size-7 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">{t('accounts.pages.labourBill.nothingYet')}</p>
          <p className="max-w-md text-xs text-muted-foreground">
            {t('accounts.pages.labourBill.scanOnto')}{' '}
            <Link to={`/labour-bills/${month.id}`} className="font-medium text-primary hover:underline">
              {month.billNumber}
            </Link>
            , and each CSD appears here with what it is owed.
          </p>
        </div>
      )}

      <Panel
        title={t('accounts.pages.labourBill.paymentsReceived')}
        description={t('accounts.pages.labourBill.paymentsHint')}
      >
        <EntryList
          records={receipts}
          isLoading={false}
          errorMessage={null}
          onRetry={() => undefined}
          canWrite={canWrite}
          emptyTitle="No payment recorded yet"
          emptyDescription="Record one from the CSD it settles, and it appears here."
        />
      </Panel>
    </div>
  )
}
