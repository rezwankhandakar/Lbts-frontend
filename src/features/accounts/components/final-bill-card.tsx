import { ArrowDownLeft, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useEntryDialog } from '../hooks/use-entry-dialog'
import { formatDay, signedTaka, taka } from '../lib/accounts-meta'
import type { FinalBillRecord } from '../types'
import { ProgressBar, SettlementBadge } from './account-atoms'

interface FinalBillCardProps {
  bill: FinalBillRecord
  canWrite: boolean
  onEdit: () => void
  onDelete: () => void
}

/**
 * One unit's month: what was asked, what the audit approved, and how much of
 * it has arrived. Recording a payment opens a Walton deposit already pointed
 * at this bill with what is left to receive.
 */
export function FinalBillCard({ bill, canWrite, onEdit, onDelete }: FinalBillCardProps) {
  const dialog = useEntryDialog()
  const hasExcel = bill.excelBills.length > 0

  return (
    <article className="flex flex-col rounded-xl border bg-card shadow-xs">
      <header className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{bill.periodLabel}</p>
          <h3 className="font-mono text-base font-semibold tracking-tight">{bill.unit}</h3>
        </div>
        <SettlementBadge status={bill.paymentStatus} receiving />
        {canWrite && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${bill.unit} ${bill.periodLabel}`} />}>
              <MoreHorizontal aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil aria-hidden />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 aria-hidden />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 px-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Excel bill</dt>
          <dd className="tabular-nums">{hasExcel ? taka(bill.submittedAmount) : '—'}</dd>
        </div>
        <div className="text-right">
          <dt className="text-xs text-muted-foreground">Final bill</dt>
          <dd className="text-lg leading-tight font-semibold tabular-nums">{taka(bill.finalAmount)}</dd>
        </div>
        {hasExcel && (
          <div className="col-span-2 flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5 text-xs">
            <span className="text-muted-foreground">Audit difference</span>
            <span className={cn('font-semibold tabular-nums', bill.difference < 0 && 'text-tone-rose', bill.difference > 0 && 'text-tone-emerald')}>
              {bill.difference === 0 ? 'No change' : signedTaka(bill.difference)}
            </span>
          </div>
        )}
      </dl>

      <div className="grid gap-1.5 px-4 pt-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{taka(bill.receivedAmount)} received</span>
          <span>{bill.outstanding > 0 ? `${taka(bill.outstanding)} left` : 'Fully received'}</span>
        </div>
        <ProgressBar value={bill.receivedAmount} max={bill.finalAmount} tone={bill.outstanding > 0 ? 'amber' : 'emerald'} />
      </div>

      <div className="mt-auto grid gap-2 p-4 pt-3">
        <p className="flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
          {bill.referenceNo && <span>Ref {bill.referenceNo}</span>}
          {bill.receivedOn && <span>Final bill on {formatDay(bill.receivedOn)}</span>}
          {bill.excelBills.map((excel) => (
            <Link key={excel.id} to={`/bills/${excel.id}`} className="font-mono hover:text-primary">
              {excel.billNumber}
            </Link>
          ))}
        </p>
        {bill.note && <p className="line-clamp-2 text-xs text-muted-foreground italic">{bill.note}</p>}
        {canWrite && bill.outstanding > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              dialog.open({
                kind: 'Deposit',
                preset: { finalBillId: bill.id, amount: bill.outstanding },
                locked: ['finalBillId'],
              })
            }
          >
            <ArrowDownLeft data-icon="inline-start" aria-hidden />
            Record payment received
          </Button>
        )}
      </div>
    </article>
  )
}
