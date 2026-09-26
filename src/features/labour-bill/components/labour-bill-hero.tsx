import { ArrowLeft, Building2, CalendarDays, Download, FileSignature, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'
import type { LabourBillRecord } from '../types'
import { LabourBillActionsMenu } from './labour-bill-actions-menu'
import type { LabourBillDialog } from './labour-bill-actions-menu'
import { LabourBillStatusBadge } from './labour-bill-badges'
import { LabourBillStats } from './labour-bill-stats'
import { useT } from '@/lib/i18n'
import type { Translator } from '@/lib/i18n'

interface LabourBillHeroProps {
  bill: LabourBillRecord
  canWrite: boolean
  canReview: boolean
  isExporting: boolean
  isRefreshing: boolean
  onExport: () => void
  onRefresh: () => void
  onOpen: (dialog: Exclude<LabourBillDialog, null>) => void
}

/**
 * Who opened it, and — the part that matters later — who signed it off or
 * reopened it.
 *
 * Each clause is a whole message rather than a date with a name appended:
 * "finalized on the 3rd by Rahim" puts the actor last in English and before
 * the verb in Bangla, so there is nothing here a template could assemble.
 */
function provenance(bill: LabourBillRecord, t: Translator): string {
  const parts = [
    bill.createdBy
      ? t('labourBill.details.openedBy', {
          when: formatDateTime(bill.createdAt),
          name: bill.createdBy.name,
        })
      : t('labourBill.details.opened', { when: formatDateTime(bill.createdAt) }),
  ]
  if (bill.status === 'Finalized' && bill.finalizedAt) {
    parts.push(
      bill.finalizedBy
        ? t('labourBill.details.finalizedOnBy', {
            when: formatDateTime(bill.finalizedAt),
            name: bill.finalizedBy.name,
          })
        : t('labourBill.details.finalizedOn', { when: formatDateTime(bill.finalizedAt) }),
    )
  } else if (bill.reopenedAt) {
    parts.push(
      bill.reopenedBy
        ? t('labourBill.details.reopenedOnBy', {
            when: formatDateTime(bill.reopenedAt),
            name: bill.reopenedBy.name,
          })
        : t('labourBill.details.reopenedOn', { when: formatDateTime(bill.reopenedAt) }),
    )
  }
  return parts.join(' · ')
}

/** The bill's identity, its primary actions and its figures, at the top of its page. */
export function LabourBillHero({
  bill,
  canWrite,
  canReview,
  isExporting,
  isRefreshing,
  onExport,
  onRefresh,
  onOpen,
}: LabourBillHeroProps) {
  const t = useT()

  return (
    <section className="relative mb-5 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-tone-cyan/5"
      />

      <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            to="/labour-bills"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            {t('labourBill.allBills')}
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <h1 className="font-mono text-xl font-semibold tracking-tight sm:text-2xl">
              {bill.billNumber}
            </h1>
            <LabourBillStatusBadge status={bill.status} />
          </div>

          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden />
              <span className="font-medium text-foreground">{bill.periodLabel}</span>
            </span>
            {bill.company && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="size-4" aria-hidden />
                <span className="font-medium text-foreground">{bill.company}</span>
              </span>
            )}
          </p>

          {bill.note && <p className="mt-2 max-w-xl text-sm text-pretty">{bill.note}</p>}
          <p className="mt-2 text-xs text-muted-foreground">{provenance(bill, t)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Before the spreadsheet, because the paper is what goes with it and
              somebody assembling a month reaches for both. Offered to every
              reader: printing what already exists changes no record. */}
          <Button variant="outline" onClick={() => onOpen('copies')}>
            <FileSignature data-icon="inline-start" aria-hidden />
            {t('labourBill.signedCopies')}
          </Button>
          <Button variant="outline" onClick={onExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />
            ) : (
              <Download data-icon="inline-start" aria-hidden />
            )}
            {isExporting ? t('labourBill.details.building') : t('labourBill.details.downloadExcel')}
          </Button>
          <LabourBillActionsMenu
            bill={bill}
            canWrite={canWrite}
            canReview={canReview}
            isRefreshing={isRefreshing}
            onOpen={onOpen}
            onRefresh={onRefresh}
          />
        </div>
      </div>

      <LabourBillStats bill={bill} />
    </section>
  )
}
