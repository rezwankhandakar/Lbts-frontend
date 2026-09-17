import { ArrowLeft } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Panel } from '@/features/accounts/components/account-atoms'
import { AccountsShell } from '@/features/accounts/components/accounts-shell'
import { EntryList } from '@/features/accounts/components/entry-list'
import { PeriodStepper } from '@/features/accounts/components/period-stepper'
import { VendorBillHero } from '@/features/accounts/components/vendor-bill-hero'
import { VendorStatementButton } from '@/features/accounts/components/vendor-statement-button'
import { VendorHistory } from '@/features/accounts/components/vendor-history'
import { VendorTripTable } from '@/features/accounts/components/vendor-trip-table'
import { useVendorBill } from '@/features/accounts/hooks/use-accounts'
import { currentPeriod, parsePeriodParam, periodParam, taka } from '@/features/accounts/lib/accounts-meta'
import { canWriteAccounts } from '@/features/accounts/types'
import type { Period } from '@/features/accounts/types'
import { useCurrentRole } from '@/hooks/use-current-role'

/**
 * One vendor's month. The month lives in the URL (`?month=2026-09`), because a
 * link to "what we owe Malek Transport for August" is worth sending somebody.
 */
export function AccountsVendorBillPage() {
  const { vendorId } = useParams<{ vendorId: string }>()
  const canWrite = canWriteAccounts(useCurrentRole())
  const [searchParams, setSearchParams] = useSearchParams()
  const period = parsePeriodParam(searchParams.get('month')) ?? currentPeriod()
  const query = useVendorBill(vendorId, period)
  const detail = query.data

  const setPeriod = (next: Period) => setSearchParams({ month: periodParam(next) }, { replace: true })

  return (
    <AccountsShell
      title={detail ? `${detail.vendor.name} · Trip bill` : 'Vendor trip bill'}
      description="Every trip in the month with its rent and labour bill, the advances paid against them, and the monthly payments."
      actions={
        <>
          <Button variant="outline" size="sm" render={<Link to={`/accounts/vendor-bills?month=${periodParam(period)}`} />}>
            <ArrowLeft data-icon="inline-start" aria-hidden />
            All vendors
          </Button>
          {detail && vendorId && (
            <VendorStatementButton vendorId={vendorId} vendorName={detail.vendor.name} period={period} detail={query.isPlaceholderData ? undefined : detail} />
          )}
          <PeriodStepper period={period} onChange={setPeriod} />
        </>
      }
    >
      {query.isError ? (
        <p className="rounded-xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">{query.error.message}</p>
      ) : !detail ? (
        <div className="grid gap-5">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-5">
          <VendorBillHero detail={detail} canWrite={canWrite} />

          <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
            <div className="grid min-w-0 content-start gap-5">
              <Panel title={`Trips · ${detail.period.label}`} description="Bills are entered on each trip's page; advances are paid from here.">
                <VendorTripTable trips={detail.trips} canWrite={canWrite} />
              </Panel>

              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Trip advances" description={`${taka(detail.figures.advance)} against this month's trips`}>
                  <EntryList
                    records={detail.advances}
                    isLoading={false}
                    errorMessage={null}
                    onRetry={() => void query.refetch()}
                    canWrite={canWrite}
                    compact
                    emptyTitle="No advance"
                    emptyDescription="Use Advance on a trip to pay the vendor ahead of the bill."
                  />
                </Panel>
                <Panel title="Payments" description={`${taka(detail.figures.paid)} paid for ${detail.period.label}`}>
                  <EntryList
                    records={detail.payments}
                    isLoading={false}
                    errorMessage={null}
                    onRetry={() => void query.refetch()}
                    canWrite={canWrite}
                    compact
                    emptyTitle="Nothing paid yet"
                    emptyDescription="The monthly payment settles what the advances left."
                  />
                </Panel>
              </div>
            </div>

            <VendorHistory history={detail.history} allTime={detail.allTime} period={period} onSelect={setPeriod} />
          </div>
        </div>
      )}
    </AccountsShell>
  )
}
