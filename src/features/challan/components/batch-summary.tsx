import { CircleCheck, Download, FileStack, Loader2, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { formatBytes } from '../lib/challan-meta'
import type { ChallanBatchDetail, PageRange } from '../types'
import { BatchAccounting } from './batch-accounting'
import { BatchPrintStatus } from './batch-print-status'
import { ChallanBatchStatusBadge } from './challan-status-badge'

interface BatchSummaryProps {
  batch: ChallanBatchDetail
  isDownloading: boolean
  onDownload: () => void
  isPrinting: boolean
  onPrint: () => void
  /** False for a viewer who may not change this batch — CEO, or a colleague. */
  canChange: boolean
  isSaving: boolean
  onMarkBlank: (range: PageRange) => void
  onClearBlank: () => void
  onClearPrinted: () => void
}

/**
 * One source PDF: what came out of it, and what can now be done with the lot.
 *
 * This page exists because the source file does not survive the session, so
 * this header is the only durable description of a document that was
 * deliberately never stored — its name, its size, and how far through it
 * somebody got.
 *
 * The two actions are the reason an operator comes back here. **Print batch**
 * is the job: fifteen challans cut out of one WhatsApp file have to end up as
 * fifteen sheets on the counter, and printing them one record at a time is
 * fifteen dialogs and no way to know afterwards which one was missed.
 * **Download** is the same document saved instead of printed. Both are refused
 * while the batch is unfinished — see `BatchAccounting` for why that matters
 * more than it looks.
 *
 * The print state sits under them rather than beside the status badge,
 * because it is a fact about paper and `Completed` is a fact about pages. They
 * are two different questions and reading as one badge would blur both.
 */
export function BatchSummary({
  batch,
  isDownloading,
  onDownload,
  isPrinting,
  onPrint,
  canChange,
  isSaving,
  onMarkBlank,
  onClearBlank,
  onClearPrinted,
}: BatchSummaryProps) {
  const busy = isDownloading || isPrinting

  return (
    <section
      aria-label="Batch summary"
      className="overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1',
              batch.isComplete
                ? 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20'
                : 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
            )}
          >
            {batch.isComplete ? (
              <CircleCheck className="size-5" aria-hidden />
            ) : (
              <FileStack className="size-5" aria-hidden />
            )}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className="truncate text-lg font-semibold tracking-tight"
                title={batch.sourceFileName}
              >
                {batch.sourceFileName}
              </h1>
              <ChallanBatchStatusBadge status={batch.status} />
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {batch.sourcePageCount} {batch.sourcePageCount === 1 ? 'page' : 'pages'} ·{' '}
              {batch.challanCount} {batch.challanCount === 1 ? 'challan' : 'challans'} filed
              {batch.sourceFileSize ? ` · ${formatBytes(batch.sourceFileSize)}` : ''}
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Started {formatDateTime(batch.createdAt)}
              {batch.createdBy ? ` by ${batch.createdBy.name}` : ''}
              {batch.completedAt ? ` · completed ${formatDateTime(batch.completedAt)}` : ''}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {/* The primary action, because printing is what the paperwork is
              for. Downloading it is the same document kept rather than used. */}
          <Button onClick={onPrint} disabled={!batch.isComplete || busy}>
            {isPrinting ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
            ) : (
              <Printer data-icon="inline-start" aria-hidden />
            )}
            {isPrinting ? 'Assembling…' : 'Print all challans'}
          </Button>

          <Button variant="outline" onClick={onDownload} disabled={!batch.isComplete || busy}>
            {isDownloading ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
            ) : (
              <Download data-icon="inline-start" aria-hidden />
            )}
            {isDownloading ? 'Assembling…' : 'Download batch PDF'}
          </Button>
        </div>
      </div>

      <div className="border-t px-4 py-4 sm:px-5">
        <BatchAccounting
          batch={batch}
          canChange={canChange}
          isSaving={isSaving}
          onMarkBlank={onMarkBlank}
          onClearBlank={onClearBlank}
        />

        {batch.challanCount > 0 && (
          <BatchPrintStatus
            className="mt-2.5"
            challanCount={batch.challanCount}
            printedChallanCount={batch.printedChallanCount}
            isPrinted={batch.isPrinted}
            canChange={canChange}
            isSaving={isSaving}
            onClear={onClearPrinted}
          />
        )}
      </div>
    </section>
  )
}
