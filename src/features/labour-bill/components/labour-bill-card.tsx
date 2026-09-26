import { Building2, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatNumber, formatRelative, formatTaka } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { labourBillStatusMeta, shortMonth } from '../lib/labour-bill-meta'
import type { LabourBillRecord } from '../types'
import { LabourBillStatusBadge } from './labour-bill-badges'

/**
 * One labour bill in the list: the month as a calendar tile, the amount large,
 * and the three counts somebody checks a bill by before opening it.
 */
export function LabourBillCard({ bill }: { bill: LabourBillRecord }) {
  const t = useT()

  const status = labourBillStatusMeta(bill.status, t)
  const counts: [string, number][] = [
    [t('labourBill.stats.challans'), bill.challanCount],
    [t('labourBill.stats.rows'), bill.lineCount],
    [t('labourBill.stats.pcs'), bill.totalQty],
  ]

  return (
    <Link
      to={`/labour-bills/${bill.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition outline-none hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className={cn('absolute inset-x-0 top-0 h-1', status.dot)} aria-hidden />

      <div className="flex items-start gap-3 p-4 pb-3">
        <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <span className="text-[12px] leading-none font-bold tracking-wider uppercase">
            {shortMonth(bill.month)}
          </span>
          <span className="mt-1 text-[11px] leading-none tabular-nums opacity-80">{bill.year}</span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="truncate font-mono text-[12.5px] font-semibold group-hover:text-primary">
              {bill.billNumber}
            </span>
            <LabourBillStatusBadge status={bill.status} />
          </span>
          <span className="mt-1 block truncate text-[13px] font-medium">{bill.periodLabel}</span>
          {bill.company && (
            <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Building2 className="size-3 shrink-0" aria-hidden />
              {bill.company}
            </span>
          )}
        </span>
      </div>

      <div className="px-4">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {t('labourBill.cardTotal')}
        </span>
        <span className="block text-2xl font-semibold tracking-tight tabular-nums">
          {formatTaka(bill.totalAmount)}
        </span>
        <span className="block text-[11.5px] text-muted-foreground">
          {t('labourBill.stats.labourAndFloor', {
            labour: formatTaka(bill.labourTotal),
            floor: formatTaka(bill.floorTotal),
          })}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-3 divide-x border-y bg-muted/30 text-center">
        {counts.map(([label, value]) => (
          <div key={label} className="px-2 py-2">
            <dt className="text-[10.5px] font-medium tracking-wide text-muted-foreground uppercase">
              {label}
            </dt>
            <dd className="text-sm font-semibold tabular-nums">{formatNumber(value)}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center justify-between gap-2 px-4 py-2.5 text-[11.5px] text-muted-foreground">
        <span className="truncate">
          {bill.createdBy
            ? t('labourBill.stats.updatedBy', {
                name: bill.createdBy.name,
                when: formatRelative(bill.updatedAt),
              })
            : t('labourBill.stats.updated', { when: formatRelative(bill.updatedAt) })}
        </span>
        {bill.unpricedLines > 0 && (
          <span className="inline-flex shrink-0 items-center gap-1 font-medium text-tone-amber">
            <TriangleAlert className="size-3" aria-hidden />
            {t('labourBill.stats.blank', { n: formatNumber(bill.unpricedLines) })}
          </span>
        )}
      </div>
    </Link>
  )
}
