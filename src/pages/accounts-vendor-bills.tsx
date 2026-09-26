import { CircleDollarSign, HandCoins, Search, Truck, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { StatTile } from '@/features/accounts/components/account-atoms'
import { AccountsShell } from '@/features/accounts/components/accounts-shell'
import { PeriodStepper } from '@/features/accounts/components/period-stepper'
import { VendorBillTable } from '@/features/accounts/components/vendor-bill-table'
import { useVendorBills } from '@/features/accounts/hooks/use-accounts'
import { currentPeriod, parsePeriodParam, taka, vendorStatusMeta } from '@/features/accounts/lib/accounts-meta'
import { VENDOR_BILL_STATUSES, canWriteAccounts } from '@/features/accounts/types'
import type { Period, VendorBillStatusFilter } from '@/features/accounts/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { formatNumber } from '@/lib/format'
import { countOf, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * The status filter's values, without their words.
 *
 * A table of labels built at module scope keeps whichever language the tab was
 * opened in, so the label is looked up per render — `all` and `due` from the
 * dictionary, the rest through `vendorStatusMeta`, which is the same word the
 * badge on the row uses.
 */
const STATUS_OPTIONS: VendorBillStatusFilter[] = ['all', 'due', ...VENDOR_BILL_STATUSES]

/**
 * Every vendor's trip bill for one month — rent and labour off the trips, less
 * the advances paid against those trips, less what has been paid for the month.
 */
export function AccountsVendorBillsPage() {
  const t = useT()

  const canWrite = canWriteAccounts(useCurrentRole())
  const [searchParams] = useSearchParams()
  const [period, setPeriod] = useState<Period>(() => parsePeriodParam(searchParams.get('month')) ?? currentPeriod())
  const [status, setStatus] = useState<VendorBillStatusFilter>(searchParams.get('status') === 'due' ? 'due' : 'all')
  const [search, setSearch] = useState('')
  const query = useVendorBills(period, status, useDebouncedValue(search.trim(), 300))
  const totals = query.data?.totals

  return (
    <AccountsShell
      title={t('accounts.pages.vendorBills.title')}
      description="Each vendor's month: trip rent and labour bill from the trips, advances already paid against them, and what is left to pay."
      actions={<PeriodStepper period={period} onChange={setPeriod} />}
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={t('accounts.pages.vendorBills.billThisMonth')}
          value={taka(totals?.totalBill ?? 0)}
          hint={
            totals &&
            t('accounts.pages.vendorBills.billHint', {
              trips: countOf(totals.tripCount, 'nouns.trip', t),
              vendors: countOf(totals.vendors, 'nouns.vendor', t),
            })
          }
          icon={Truck}
          tone="indigo"
          isLoading={query.isPending}
        />
        <StatTile
          label={t('accounts.pages.vendorBills.advanced')}
          value={taka(totals?.advance ?? 0)}
          hint={t('accounts.pages.vendorBills.advancedHint')}
          icon={HandCoins}
          tone="orange"
          isLoading={query.isPending}
        />
        <StatTile
          label={t('accounts.pages.vendorBills.paid')}
          value={taka(totals?.paid ?? 0)}
          hint={t('accounts.pages.vendorBills.paidHint')}
          icon={Wallet}
          tone="emerald"
          isLoading={query.isPending}
        />
        <StatTile
          label={t('accounts.pages.vendorBills.stillDue')}
          value={taka(totals?.due ?? 0)}
          hint={
            totals &&
            (totals.overpaid > 0
              ? t('accounts.pages.vendorBills.overpaidElsewhere', {
                  amount: taka(totals.overpaid),
                })
              : totals.blankBills > 0
                ? t('accounts.pages.vendorBills.blankBills', {
                    n: formatNumber(totals.blankBills),
                  })
                : t('accounts.pages.vendorBills.afterEverything'))
          }
          icon={CircleDollarSign}
          tone="rose"
          onClick={() => setStatus(status === 'due' ? 'all' : 'due')}
          pressed={status === 'due'}
          isLoading={query.isPending}
        />
      </div>

      <section aria-label={t('accounts.pages.vendorBills.listAria')} className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b bg-muted/20 p-3 sm:p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} aria-label={t('accounts.pages.vendorBills.searchAria')} className="pl-8.5" />
          </div>
          <div
            role="radiogroup"
            aria-label={t('accounts.pages.vendorBills.statusAria')}
            className="flex w-fit flex-wrap gap-1 rounded-lg border bg-card p-0.5"
          >
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={status === option}
                onClick={() => setStatus(option)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition',
                  status === option ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option === 'all'
                  ? t('common.labels.all')
                  : option === 'due'
                    ? t('accounts.vendorBills.hasDue')
                    : vendorStatusMeta(option, t).label}
              </button>
            ))}
          </div>
        </div>

        {query.isError ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">{query.error.message}</p>
        ) : (
          <VendorBillTable rows={query.data?.rows ?? []} period={period} isLoading={query.isPending} canWrite={canWrite} />
        )}
      </section>
    </AccountsShell>
  )
}
