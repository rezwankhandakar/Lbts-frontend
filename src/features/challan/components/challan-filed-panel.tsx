import { ArrowRight, CircleCheck, Download, Eye, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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
 * the only moment they see what the sheet in front of them is now called.
 *
 * It is one row rather than a card, and that is a layout decision with a
 * reason: it appears above a split whose whole purpose is showing a challan
 * page and its form at once, and a card holding a stacked definition list over
 * a row of buttons took a fifth of the page an operator was reading. Nothing
 * is lost by flattening it — the numbers are still the largest text on the
 * strip, and the source pages it came from are already the range drawn in the
 * page strip under the viewer.
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
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-tone-emerald/30 bg-tone-emerald/5 px-3 py-2"
    >
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-tone-emerald">
        <CircleCheck className="size-4" aria-hidden />
        Filed
      </span>

      <dl className="flex min-w-0 flex-wrap items-baseline gap-x-5 gap-y-1">
        <div className="flex items-baseline gap-1.5">
          <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            SL
          </dt>
          <dd className="text-base leading-none font-semibold tabular-nums">{record.slNumber}</dd>
        </div>
        <div className="flex min-w-0 items-baseline gap-1.5">
          <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Challan
          </dt>
          <dd className="truncate text-base leading-none font-semibold">{record.challanNumber}</dd>
        </div>
      </dl>

      <div className="ml-auto flex shrink-0 flex-wrap items-center gap-1.5">
        {nextLabel ? (
          <Button size="xs" onClick={onNext}>
            {nextLabel}
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Button>
        ) : (
          <Button size="xs" variant="outline" onClick={onDismiss}>
            Close
          </Button>
        )}

        <Button
          variant="outline"
          size="xs"
          render={<Link to={`/challan/${record.id}`} target="_blank" rel="noreferrer" />}
        >
          <Eye data-icon="inline-start" aria-hidden />
          View
        </Button>

        <Button variant="outline" size="xs" onClick={() => onPrint(record)}>
          <Printer data-icon="inline-start" aria-hidden />
          Print
        </Button>

        <Button variant="outline" size="xs" onClick={() => onDownload(record)}>
          <Download data-icon="inline-start" aria-hidden />
          Download
        </Button>
      </div>
    </section>
  )
}
