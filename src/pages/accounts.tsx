import { ArrowRight, FileClock, HandCoins, RefreshCcw, TriangleAlert, Truck, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Panel, StatTile } from '@/features/accounts/components/account-atoms'
import { AccountsShell } from '@/features/accounts/components/accounts-shell'
import { AttentionPanel } from '@/features/accounts/components/attention-panel'
import { BalanceHero } from '@/features/accounts/components/balance-hero'
import { EntryList } from '@/features/accounts/components/entry-list'
import { MonthProfitCard } from '@/features/accounts/components/month-profit-card'
import { QuickActions } from '@/features/accounts/components/quick-actions'
import { TrendChart } from '@/features/accounts/components/trend-chart'
import { useAccountsOverview } from '@/features/accounts/hooks/use-accounts'
import { signedTaka, taka, todayString } from '@/features/accounts/lib/accounts-meta'
import { canWriteAccounts } from '@/features/accounts/types'
import { useCurrentRole } from '@/hooks/use-current-role'

/**
 * The Accounts landing page: what is on hand, what to do, what is owed and
 * how the months are going — in one request, because a sleeping instance pays
 * a cold start per call.
 */
export function AccountsPage() {
  const canWrite = canWriteAccounts(useCurrentRole())
  const query = useAccountsOverview(todayString())
  const overview = query.data

  return (
    <AccountsShell
      title="Accounts"
      description="Money in and out, vendor trip bills, advances, office expenses and Walton's final bills — and the profit they add up to."
    >
      {query.isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-4 py-16 text-center">
          <TriangleAlert className="size-6 text-destructive" aria-hidden />
          <p className="text-sm text-muted-foreground">{query.error.message}</p>
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            <RefreshCcw data-icon="inline-start" aria-hidden />
            Try again
          </Button>
        </div>
      ) : (
        <div className="grid gap-5">
          <BalanceHero overview={overview} />

          {canWrite && <QuickActions />}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Vendor bills due"
              value={overview ? taka(overview.vendorDue.total) : ''}
              hint={overview && `${overview.vendorDue.vendors} vendors, after advances`}
              icon={Truck}
              tone="indigo"
              to="/accounts/vendor-bills?status=due"
              isLoading={!overview}
            />
            <StatTile
              label="Open advances"
              value={overview ? taka(overview.advances.outstanding) : ''}
              hint={overview && `${overview.advances.count} not yet settled`}
              icon={HandCoins}
              tone="amber"
              to="/accounts/advances"
              isLoading={!overview}
            />
            <StatTile
              label="Receivable from Walton"
              value={overview ? taka(overview.receivable.outstanding) : ''}
              hint={overview && `${overview.receivable.count} final bills open`}
              icon={FileClock}
              tone="emerald"
              to="/accounts/final-bills"
              isLoading={!overview}
            />
            <StatTile
              label={`Profit · ${overview?.period.label ?? 'this month'}`}
              value={overview ? signedTaka(overview.profitLoss.profit) : ''}
              hint={overview && `${taka(overview.profitLoss.income)} income · ${taka(overview.profitLoss.totalCost)} cost`}
              icon={Wallet}
              tone={overview && overview.profitLoss.profit < 0 ? 'rose' : 'violet'}
              to="/accounts/profit-loss"
              isLoading={!overview}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Panel title="Last six months" description="Walton final bills against trip and office costs.">
              <div className="p-4 sm:p-5">{overview && <TrendChart months={overview.trend} />}</div>
            </Panel>
            <MonthProfitCard month={overview?.profitLoss} />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Panel
              title="Recent entries"
              action={
                <Button variant="ghost" size="sm" render={<Link to="/accounts/cash-book" />}>
                  Cash book
                  <ArrowRight data-icon="inline-end" aria-hidden />
                </Button>
              }
            >
              <EntryList
                records={overview?.recentEntries ?? []}
                isLoading={!overview}
                errorMessage={null}
                onRetry={() => void query.refetch()}
                canWrite={canWrite}
                emptyDescription="Start with Add money to record the opening balance of each wallet."
              />
            </Panel>
            <AttentionPanel overview={overview} />
          </div>
        </div>
      )}
    </AccountsShell>
  )
}
