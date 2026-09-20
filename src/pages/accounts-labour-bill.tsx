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

/**
 * One month's labour claim, split into the cards it is actually paid on.
 *
 * Every figure here is read off the labour bill's own sheet rather than stored
 * beside it, so a row corrected on the sheet changes what this page says a CSD
 * is owed — there is no second copy to refresh and nothing that can drift.
 */
export function AccountsLabourBillPage() {
  const { id = '' } = useParams()
  const canWrite = canWriteAccounts(useCurrentRole())
  const query = useLabourReceivable(id)

  return (
    <AccountsShell
      title="Walton Labour Bill"
      description="Each CSD of this month is settled on its own, so each has its own card. What it is owed comes off the labour bill sheet; what has arrived is the payments recorded here."
      actions={
        <Link to="/accounts/labour-bills" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <ArrowLeft data-icon="inline-start" aria-hidden />
          All months
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
          label="Received"
          value={taka(month.receivedAmount)}
          hint={`${receipts.length} ${receipts.length === 1 ? 'payment' : 'payments'}`}
          icon={Wallet}
          tone="emerald"
        />
        <StatTile
          label="Still to receive"
          value={taka(month.outstanding)}
          hint="Across this month's CSDs"
          icon={HandCoins}
          tone="amber"
        />
        <StatTile
          label="Open the sheet"
          value={`${payable.length} ${payable.length === 1 ? 'CSD' : 'CSDs'}`}
          hint="See the rows behind these figures"
          icon={ExternalLink}
          tone="violet"
          to={`/labour-bills/${month.id}`}
        />
      </div>

      <section aria-label="CSDs" className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {month.csds.map((csd) => (
          <LabourCsdCard key={csd.key || 'pending'} month={month} csd={csd} canWrite={canWrite} />
        ))}
      </section>

      {month.csds.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-card px-4 py-16 text-center">
          <HardHat className="size-7 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">Nothing on this month&rsquo;s labour bill yet</p>
          <p className="max-w-md text-xs text-muted-foreground">
            Scan the challans onto{' '}
            <Link to={`/labour-bills/${month.id}`} className="font-medium text-primary hover:underline">
              {month.billNumber}
            </Link>
            , and each CSD appears here with what it is owed.
          </p>
        </div>
      )}

      <Panel title="Payments received" description="Every Walton payment recorded against a CSD of this month.">
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
