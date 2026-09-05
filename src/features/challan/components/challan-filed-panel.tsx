import { ArrowRight, CircleCheck, Download, Eye, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatRange } from '../lib/challan-meta'
import type { ChallanRecord } from '../types'

interface ChallanFiledPanelProps {
  record: ChallanRecord
  /** Null once every page of the source belongs to a filed challan. */
  nextLabel: string | null
  onNext: () => void
  onDownload: (record: ChallanRecord) => void
  onPrint: (record: ChallanRecord) => void
  onDismiss: () => void
}

/**
 * What a challan became, immediately after it was filed.
 *
 * The two numbers are the point. The operator never typed either of them —
 * they are allocated server-side and printed on the barcode page — so this is
 * the only moment they see what the sheet in front of them is now called, and
 * it is worth more room than a toast gives.
 *
 * The primary action moves to the next challan rather than to this one's
 * details page, because the job is a stack and the next sheet is already
 * waiting. Viewing, printing and downloading are there for the case where the
 * paperwork goes out with the delivery straight away.
 */
export function ChallanFiledPanel({
  record,
  nextLabel,
  onNext,
  onDownload,
  onPrint,
  onDismiss,
}: ChallanFiledPanelProps) {
  return (
    <section
      aria-label="Challan filed"
      className="rounded-xl border border-tone-emerald/30 bg-tone-emerald/5 p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-tone-emerald/15 text-tone-emerald ring-1 ring-tone-emerald/25">
          <CircleCheck className="size-5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold tracking-tight">Challan filed</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatRange({
              startPage: record.sourcePageStart,
              endPage: record.sourcePageEnd,
            })}{' '}
            of {record.sourceFileName}, plus the generated LBTS back page.
          </p>

          <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                SL number
              </dt>
              <dd className="text-xl leading-tight font-semibold tabular-nums">
                {record.slNumber}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Challan number
              </dt>
              <dd className="truncate text-xl leading-tight font-semibold">
                {record.challanNumber}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {nextLabel ? (
              <Button size="sm" onClick={onNext}>
                {nextLabel}
                <ArrowRight data-icon="inline-end" aria-hidden />
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={onDismiss}>
                Close
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              render={<Link to={`/challan/${record.id}`} target="_blank" rel="noreferrer" />}
            >
              <Eye data-icon="inline-start" aria-hidden />
              View
            </Button>

            <Button variant="outline" size="sm" onClick={() => onPrint(record)}>
              <Printer data-icon="inline-start" aria-hidden />
              Print
            </Button>

            <Button variant="outline" size="sm" onClick={() => onDownload(record)}>
              <Download data-icon="inline-start" aria-hidden />
              Download
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
