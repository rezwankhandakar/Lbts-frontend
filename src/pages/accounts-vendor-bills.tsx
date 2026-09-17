import { CircleDollarSign, HandCoins, Search, Truck, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { StatTile } from '@/features/accounts/components/account-atoms'
import { AccountsShell } from '@/features/accounts/components/accounts-shell'
import { PeriodStepper } from '@/features/accounts/components/period-stepper'
import { VendorBillTable } from '@/features/accounts/components/vendor-bill-table'
import { useVendorBills } from '@/features/accounts/hooks/use-accounts'
import { VENDOR_STATUS_META, currentPeriod, parsePeriodParam, taka } from '@/features/accounts/lib/accounts-meta'
import { VENDOR_BILL_STATUSES, canWriteAccounts } from '@/features/accounts/types'
import type { Period, VendorBillStatusFilter } from '@/features/accounts/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS: { value: VendorBillStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'due', label: 'Has due' },
  ...VENDOR_BILL_STATUSES.map((status) => ({ value: status, label: VENDOR_STATUS_META[status].label })),
]

/**
 * Every vendor's trip bill for one month — rent and labour off the trips, less
 * the advances paid against those trips, less what has been paid for the month.
 */
export function AccountsVendorBillsPage() {
  const canWrite = canWriteAccounts(useCurrentRole())
  const [searchParams] = useSearchParams()
  const [period, setPeriod] = useState<Period>(() => parsePeriodParam(searchParams.get('month')) ?? currentPeriod())
  const [status, setStatus] = useState<VendorBillStatusFilter>(searchParams.get('status') === 'due' ? 'due' : 'all')
  const [search, setSearch] = useState('')
  const query = useVendorBills(period, status, useDebouncedValue(search.trim(), 300))
  const totals = query.data?.totals

  return (
    <AccountsShell
      title="Vendor Trip Bills"
      description="Each vendor's month: trip rent and labour bill from the trips, advances already paid against them, and what is left to pay."
      actions={<PeriodStepper period={period} onChange={setPeriod} />}
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Trip bill this month" value={taka(totals?.totalBill ?? 0)} hint={totals && `${totals.tripCount} trips · ${totals.vendors} vendors`} icon={Truck} tone="indigo" isLoading={query.isPending} />
        <StatTile label="Advanced on trips" value={taka(totals?.advance ?? 0)} hint="Adjusted from the bill" icon={HandCoins} tone="orange" isLoading={query.isPending} />
        <StatTile label="Paid" value={taka(totals?.paid ?? 0)} hint="Monthly payments" icon={Wallet} tone="emerald" isLoading={query.isPending} />
        <StatTile
          label="Still due"
          value={taka(totals?.due ?? 0)}
          hint={totals && (totals.overpaid > 0 ? `${taka(totals.overpaid)} overpaid elsewhere` : totals.blankBills > 0 ? `${totals.blankBills} trips have no bill yet` : 'After advances and payments')}
          icon={CircleDollarSign}
          tone="rose"
          onClick={() => setStatus(status === 'due' ? 'all' : 'due')}
          pressed={status === 'due'}
          isLoading={query.isPending}
        />
      </div>

      <section aria-label="Vendor trip bills" className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b bg-muted/20 p-3 sm:p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search vendors" className="pl-8.5" />
          </div>
          <div role="radiogroup" aria-label="Status" className="flex w-fit flex-wrap gap-1 rounded-lg border bg-card p-0.5">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={status === option.value}
                onClick={() => setStatus(option.value)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition',
                  status === option.value ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
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
