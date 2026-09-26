import { ArrowLeft, CalendarDays, Download, Factory, Loader2, PackagePlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'
import type { BillRecord } from '../types'
import { BillActionsMenu } from './bill-actions-menu'
import type { BillDialog } from './bill-actions-menu'
import { BillStatusBadge } from './bill-badges'
import { BillStats } from './bill-stats'
import { useT } from '@/lib/i18n'
import type { Translator } from '@/lib/i18n'

interface BillHeroProps {
  bill: BillRecord
  canWrite: boolean
  canReview: boolean
  isExporting: boolean
  isRefreshing: boolean
  onAdd: () => void
  onExport: () => void
  onRefresh: () => void
  onOpen: (dialog: Exclude<BillDialog, null>) => void
}

/**
 * Who opened it, and — the part that matters later — who signed it off or
 * reopened it.
 *
 * Each clause is a whole message rather than a date with a name appended, for
 * the reason the labour bill's hero gives: the actor sits in a different place
 * in the two languages.
 */
function provenance(bill: BillRecord, t: Translator): string {
  const parts = [
    bill.createdBy
      ? t('bill.details.openedBy', {
          when: formatDateTime(bill.createdAt),
          name: bill.createdBy.name,
        })
      : t('bill.details.opened', { when: formatDateTime(bill.createdAt) }),
  ]
  if (bill.status === 'Finalized' && bill.finalizedAt) {
    parts.push(
      bill.finalizedBy
        ? t('bill.details.finalizedOnBy', {
            when: formatDateTime(bill.finalizedAt),
            name: bill.finalizedBy.name,
          })
        : t('bill.details.finalizedOn', { when: formatDateTime(bill.finalizedAt) }),
    )
  } else if (bill.reopenedAt) {
    parts.push(
      bill.reopenedBy
        ? t('bill.details.reopenedOnBy', {
            when: formatDateTime(bill.reopenedAt),
            name: bill.reopenedBy.name,
          })
        : t('bill.details.reopenedOn', { when: formatDateTime(bill.reopenedAt) }),
    )
  }
  return parts.join(' · ')
}

/** The bill's identity, its primary actions and its figures, at the top of its page. */
export function BillHero({
  bill,
  canWrite,
  canReview,
  isExporting,
  isRefreshing,
  onAdd,
  onExport,
  onRefresh,
  onOpen,
}: BillHeroProps) {
  const t = useT()

  const isDraft = bill.status === 'Draft'

  return (
    <section className="relative mb-5 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-tone-emerald/5"
      />

      <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            to="/bills"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            {t('bill.allBills')}
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <h1 className="font-mono text-xl font-semibold tracking-tight sm:text-2xl">{bill.billNumber}</h1>
            <BillStatusBadge status={bill.status} />
          </div>

          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden />
              <span className="font-medium text-foreground">{bill.periodLabel}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Factory className="size-4" aria-hidden />
              {t('bill.form.unit')}
              <span className="rounded-md border bg-background px-1.5 py-px font-mono text-xs font-semibold text-foreground">
                {bill.unit}
              </span>
            </span>
          </p>

          {bill.note && <p className="mt-2 max-w-xl text-sm text-pretty">{bill.note}</p>}
          <p className="mt-2 text-xs text-muted-foreground">{provenance(bill, t)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isDraft && canWrite && (
            <Button onClick={onAdd}>
              <PackagePlus data-icon="inline-start" aria-hidden />
              {t('bill.addTripDo')}
            </Button>
          )}
          <Button variant="outline" onClick={onExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />
            ) : (
              <Download data-icon="inline-start" aria-hidden />
            )}
            {isExporting ? t('bill.details.building') : t('bill.details.downloadExcel')}
          </Button>
          <BillActionsMenu
            bill={bill}
            canWrite={canWrite}
            canReview={canReview}
            isRefreshing={isRefreshing}
            onOpen={onOpen}
            onRefresh={onRefresh}
          />
        </div>
      </div>

      <BillStats bill={bill} />
    </section>
  )
}
