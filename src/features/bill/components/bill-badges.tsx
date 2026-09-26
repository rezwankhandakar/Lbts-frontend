import { Receipt } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import type { Translator } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { billStatusMeta, billingStatusMeta, shortBillNumber } from '../lib/bill-meta'
import type { ToneMeta } from '../lib/bill-meta'
import type { BillRef } from '../types'

/**
 * The Bill module's badges, composed into the Trip DO sheet, the challan list
 * and the gate pass records by import — they render this module's vocabulary,
 * so they live here rather than in `components/shared`.
 */

const PILL =
  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap'

function ToneBadge({ meta, title, className }: { meta: ToneMeta; title: string; className?: string }) {
  return (
    <span className={cn(PILL, meta.badge, className)} title={title}>
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
    </span>
  )
}

/** The status, then each bill it is on, one to a line. */
function billsTitle(
  description: string,
  billNumbers: readonly string[],
  t: Translator,
): string {
  return billNumbers.length > 0
    ? t('bill.badges.tooltip', { description, bills: billNumbers.join('\n') })
    : description
}

/** Draft or Finalized. */
export function BillStatusBadge({ status, className }: { status: string; className?: string }) {
  const t = useT()

  const meta = billStatusMeta(status, t)
  return <ToneBadge meta={meta} title={meta.description} className={className} />
}

/** Whether a challan's or gate pass's rows are billed. Drawn in every state: absent would read as "unknown". */
export function BillingStatusBadge({
  status,
  billNumbers = [],
  className,
}: {
  status: string | null | undefined
  billNumbers?: readonly string[]
  className?: string
}) {
  const t = useT()

  const meta = billingStatusMeta(status, t)
  return <ToneBadge meta={meta} title={billsTitle(meta.description, billNumbers, t)} className={className} />
}

/**
 * The same status as a quiet flag, for a status cell that already carries a
 * primary badge — the shape the printed mark takes beneath a challan's status.
 */
export function BillingFlag({
  status,
  billNumbers = [],
}: {
  status: string | null | undefined
  billNumbers?: readonly string[]
}) {
  const t = useT()

  const meta = billingStatusMeta(status, t)
  const Icon = meta.icon

  return (
    <span
      className={cn('inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap', meta.text)}
      title={billsTitle(meta.description, billNumbers, t)}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {meta.label}
      {billNumbers.length > 0 && (
        <span className="font-mono text-[10.5px] opacity-80">
          {shortBillNumber(billNumbers[0])}
          {billNumbers.length > 1 && ` ${t('bill.badges.more', { n: formatNumber(billNumbers.length - 1) })}`}
        </span>
      )}
    </span>
  )
}

/** The Trip DO sheet's Bill column: the bill a row is on, as a link to it. */
export function BillRefChip({ bill }: { bill: BillRef | null }) {
  const t = useT()

  if (!bill) {
    return <span className="px-1 text-[11.5px] text-muted-foreground italic">{t('bill.notBilled')}</span>
  }

  return (
    <Link
      to={`/bills/${bill.billId}`}
      title={t('bill.badges.onBill', { bill: bill.billNumber })}
      className="inline-flex items-center gap-1 rounded-md border border-tone-emerald/25 bg-tone-emerald/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-tone-emerald transition outline-none hover:bg-tone-emerald/15 focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <Receipt className="size-3" aria-hidden />
      {shortBillNumber(bill.billNumber)}
    </Link>
  )
}
