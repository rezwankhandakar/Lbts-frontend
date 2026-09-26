import { ChevronRight, TriangleAlert, Truck, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { VendorAvatar } from '@/features/vendor/components/vendor-identity'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useEntryDialog } from '../hooks/use-entry-dialog'
import { periodParam, signedTaka, taka } from '../lib/accounts-meta'
import type { Period, VendorBillRow } from '../types'
import { VendorBillBadge } from './account-atoms'
import { VendorStatementButton } from './vendor-statement-button'

interface VendorBillTableProps {
  rows: VendorBillRow[]
  period: Period
  isLoading: boolean
  canWrite: boolean
}

function DueCell({ row }: { row: VendorBillRow }) {
  return (
    <span className={cn('font-semibold tabular-nums', row.due > 0 ? 'text-foreground' : 'text-muted-foreground')}>
      {signedTaka(row.due)}
    </span>
  )
}

/**
 * Every vendor with a trip or a payment in the month: a table from md up, a
 * card per vendor below it. The vendor opens its month; Pay opens the payment
 * form with the vendor and month already chosen.
 */
export function VendorBillTable({ rows, period, isLoading, canWrite }: VendorBillTableProps) {
  const t = useT()

  const dialog = useEntryDialog()

  if (isLoading) {
    return (
      <div className="grid gap-2 p-4" aria-busy="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-14 rounded-lg" />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
        <Truck className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium">{t('accounts.vendorBill.noneThisMonth')}</p>
        <p className="text-xs text-muted-foreground">{t('accounts.vendorBill.noneHint')}</p>
      </div>
    )
  }

  const pay = (row: VendorBillRow) =>
    dialog.open({
      kind: 'VendorPayment',
      preset: { vendorId: row.vendor.id, year: period.year, month: period.month, amount: row.due > 0 ? row.due : null },
      locked: ['vendorId'],
    })
  const detailLink = (row: VendorBillRow) => `/accounts/vendor-bills/${row.vendor.id}?month=${periodParam(period)}`

  return (
    <>
      <table className="hidden w-full text-sm lg:table">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">{t('accounts.vendorBill.vendor')}</th>
            <th className="px-2 py-2.5 text-right font-medium">{t('accounts.vendorBill.trips')}</th>
            <th className="px-2 py-2.5 text-right font-medium">{t('accounts.profit.tripRent')}</th>
            <th className="px-2 py-2.5 text-right font-medium">{t('accounts.profit.labour')}</th>
            <th className="px-2 py-2.5 text-right font-medium">{t('accounts.trip.advance')}</th>
            <th className="px-2 py-2.5 text-right font-medium">{t('accounts.vendorBill.paid')}</th>
            <th className="px-2 py-2.5 text-right font-medium">Due</th>
            <th className="px-4 py-2.5 text-right font-medium" aria-label={t('accounts.list.actions')} />
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.vendor.id} className="transition-colors hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <VendorAvatar name={row.vendor.name} photoUrl={row.vendor.photoUrl} caption={row.vendor.vendorCode} />
                  <div className="min-w-0">
                    <Link to={detailLink(row)} className="block truncate font-medium hover:text-primary hover:underline">
                      {row.vendor.name}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-[11px] text-muted-foreground">{row.vendor.vendorCode}</span>
                      <VendorBillBadge status={row.status} />
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-2 py-3 text-right tabular-nums">
                {row.tripCount}
                {row.blankBills > 0 && (
                  <span className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-tone-amber">
                    <TriangleAlert className="size-3" aria-hidden />
                    {row.blankBills} blank
                  </span>
                )}
              </td>
              <td className="px-2 py-3 text-right tabular-nums">{taka(row.tripRent)}</td>
              <td className="px-2 py-3 text-right tabular-nums">{taka(row.labourBill)}</td>
              <td className="px-2 py-3 text-right text-muted-foreground tabular-nums">{taka(row.advance)}</td>
              <td className="px-2 py-3 text-right text-muted-foreground tabular-nums">{taka(row.paid)}</td>
              <td className="px-2 py-3 text-right">
                <DueCell row={row} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1.5">
                  {canWrite && row.due > 0 && (
                    <Button size="sm" onClick={() => pay(row)}>
                      <Wallet data-icon="inline-start" aria-hidden />
                      Pay
                    </Button>
                  )}
                  <VendorStatementButton vendorId={row.vendor.id} vendorName={row.vendor.name} period={period} compact />
                  <Button variant="ghost" size="icon-sm" render={<Link to={detailLink(row)} />} aria-label={t('accounts.vendorBill.openVendor', { name: row.vendor.name })}>
                    <ChevronRight aria-hidden />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="grid gap-3 p-3 sm:grid-cols-2 lg:hidden">
        {rows.map((row) => (
          <li key={row.vendor.id} className="rounded-xl border bg-card p-3.5 shadow-xs">
            <div className="flex items-center gap-3">
              <VendorAvatar name={row.vendor.name} photoUrl={row.vendor.photoUrl} />
              <div className="min-w-0 flex-1">
                <Link to={detailLink(row)} className="block truncate text-sm font-medium hover:text-primary">
                  {row.vendor.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {row.tripCount} trips{row.blankBills > 0 && ` · ${row.blankBills} blank bills`}
                </p>
              </div>
              <VendorBillBadge status={row.status} />
              <VendorStatementButton vendorId={row.vendor.id} vendorName={row.vendor.name} period={period} compact />
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <dt className="text-muted-foreground">{t('accounts.trip.bill')}</dt>
                <dd className="font-medium tabular-nums">{taka(row.totalBill)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Advance + paid</dt>
                <dd className="font-medium tabular-nums">{taka(row.advance + row.paid)}</dd>
              </div>
              <div className="text-right">
                <dt className="text-muted-foreground">Due</dt>
                <dd>
                  <DueCell row={row} />
                </dd>
              </div>
            </dl>
            {canWrite && row.due > 0 && (
              <Button size="sm" className="mt-3 w-full" onClick={() => pay(row)}>
                <Wallet data-icon="inline-start" aria-hidden />
                {t('accounts.vendorBill.pay', { amount: taka(row.due) })}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
