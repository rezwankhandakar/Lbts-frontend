import { ArrowDownLeft, CircleDashed, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useEntryDialog } from '../hooks/use-entry-dialog'
import { taka } from '../lib/accounts-meta'
import type { LabourCsdReceivable, LabourReceivableRecord } from '../types'
import { ProgressBar, SettlementBadge } from './account-atoms'

interface LabourCsdCardProps {
  month: LabourReceivableRecord
  csd: LabourCsdReceivable
  canWrite: boolean
}

/**
 * One CSD of one month: what its rows came to, and how much of it Walton has
 * paid. **This is the card a payment is recorded from**, because a CSD is what
 * the office is settled with.
 *
 * The pending section gets the same card without the button. Its rows have no
 * Trip DO, so they belong to no CSD and nobody has been billed for them — the
 * figure is shown so the month adds up, and the fix is named where the fix
 * actually is.
 */
export function LabourCsdCard({ month, csd, canWrite }: LabourCsdCardProps) {
  const t = useT()

  const dialog = useEntryDialog()

  return (
    <article
      className={cn(
        'flex flex-col rounded-xl border bg-card shadow-xs',
        csd.isPending && 'border-tone-amber/30 bg-tone-amber/5',
      )}
    >
      <header className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{month.periodLabel}</p>
          <h3
            className={cn(
              'flex items-center gap-1.5 font-mono text-base font-semibold tracking-tight',
              csd.isPending && 'font-sans text-tone-amber',
            )}
          >
            {csd.isPending && <CircleDashed className="size-4 shrink-0" aria-hidden />}
            {csd.label}
          </h3>
        </div>
        {!csd.isPending && <SettlementBadge status={csd.paymentStatus} receiving />}
      </header>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 px-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">{t('accounts.labour.received')}</dt>
          <dd className="tabular-nums">{csd.isPending ? '—' : taka(csd.receivedAmount)}</dd>
        </div>
        <div className="text-right">
          <dt className="text-xs text-muted-foreground">{t('accounts.labour.billed')}</dt>
          <dd className="text-lg leading-tight font-semibold tabular-nums">{taka(csd.billedAmount)}</dd>
        </div>
        <div className="col-span-2 flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5 text-xs">
          <span className="text-muted-foreground">
            {csd.rows} {csd.rows === 1 ? 'row' : 'rows'} · {csd.challans}{' '}
            {csd.challans === 1 ? 'challan' : 'challans'} · {csd.qty} pcs
          </span>
          <span className="tabular-nums text-muted-foreground">
            {taka(csd.labourTotal)} + {taka(csd.floorTotal)}
          </span>
        </div>
      </dl>

      {!csd.isPending && (
        <div className="grid gap-1.5 px-4 pt-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{taka(csd.receivedAmount)} received</span>
            <span>
              {csd.outstanding > 0
                ? t('accounts.finalBill.amountLeft', { amount: taka(csd.outstanding) })
                : t('accounts.finalBill.fullyReceived')}
            </span>
          </div>
          <ProgressBar
            value={csd.receivedAmount}
            max={csd.billedAmount}
            tone={csd.outstanding > 0 ? 'amber' : 'emerald'}
          />
        </div>
      )}

      <div className="mt-auto grid gap-2 p-4 pt-3">
        {csd.unpricedLines > 0 && (
          <p className="inline-flex items-start gap-1 text-[11px] text-tone-amber">
            <TriangleAlert className="mt-px size-3 shrink-0" aria-hidden />
            <span className="text-pretty">
              {csd.unpricedLines} {csd.unpricedLines === 1 ? 'row has' : 'rows have'} no amount typed,
              so the billed figure leaves {csd.unpricedLines === 1 ? 'it' : 'them'} out
            </span>
          </p>
        )}

        {csd.isPending ? (
          <p className="text-[11px] text-pretty text-muted-foreground">
            {t('accounts.labour.pendingRows')} Set it on the{' '}
            <Link to="/trip-do" className="font-medium text-primary hover:underline">
              {t('accounts.labour.tripDoSheet')}
            </Link>
            , and they move into their own CSD by themselves.
          </p>
        ) : (
          canWrite &&
          csd.outstanding > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                dialog.open({
                  kind: 'Deposit',
                  preset: {
                    labourBillId: month.id,
                    labourCsd: csd.csd,
                    amount: csd.outstanding,
                  },
                  locked: ['labourBillId'],
                })
              }
            >
              <ArrowDownLeft data-icon="inline-start" aria-hidden />
              {t('accounts.finalBill.recordPayment')}
            </Button>
          )
        )}
      </div>
    </article>
  )
}
