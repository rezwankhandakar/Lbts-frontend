import { Sigma, Truck, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface TripListSummaryProps {
  /** "89 trips · 249 challans · 1,079 pieces" — already a whole sentence. */
  summary?: string
  /** Rent and labour across every trip the filters match, not just this page. */
  totals?: { rent: number; labour: number }
}

/**
 * What the filters add up to, as one strip between the toolbar and the table.
 *
 * The figures answer the filters rather than the page — "how much rent did
 * Malek Transport's trips come to last month" is one vendor filter, one date
 * chip and one number — which is the rule every total in this app keeps. They
 * were three tinted pills the size of the chips beside them; a figure somebody
 * reads off for a bill is a label and an amount in type it can be read in.
 */
export function TripListSummary({ summary, totals }: TripListSummaryProps) {
  const t = useT()
  const format = useFormatters()

  if (!summary && !totals) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t bg-muted/30 px-4 py-2.5">
      {summary && <p className="text-[13px] font-medium text-foreground/80">{summary}</p>}

      {totals && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:ms-auto">
          <Figure icon={Truck} tile="bg-tone-amber/10 text-tone-amber" label={t('delivery.table.tripRent')}>
            {format.taka(totals.rent)}
          </Figure>
          <Figure icon={Users} tile="bg-tone-violet/10 text-tone-violet" label={t('delivery.table.labourBill')}>
            {format.taka(totals.labour)}
          </Figure>
          <Figure icon={Sigma} tile="bg-tone-emerald/10 text-tone-emerald" label={t('delivery.table.total')} strong>
            {format.taka(totals.rent + totals.labour)}
          </Figure>
        </div>
      )}
    </div>
  )
}

function Figure({
  icon: Icon,
  tile,
  label,
  strong = false,
  children,
}: {
  icon: LucideIcon
  /** Full literal classes, so Tailwind sees them. */
  tile: string
  label: string
  strong?: boolean
  children: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn('flex size-7 items-center justify-center rounded-lg', tile)}>
        <Icon className="size-3.5" aria-hidden />
      </span>
      <div>
        <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
        <p className={cn('text-sm leading-tight font-bold tabular-nums', strong && 'text-tone-emerald')}>{children}</p>
      </div>
    </div>
  )
}
