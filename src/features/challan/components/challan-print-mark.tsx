import { Printer, PrinterCheck } from 'lucide-react'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ChallanRecord } from '../types'

interface ChallanPrintMarkProps {
  record: Pick<ChallanRecord, 'printedAt' | 'printedBy'>
  className?: string
}

/**
 * Whether this challan has been printed.
 *
 * Shown in both states rather than only when it is true. A challan that has
 * not been printed is the one thing an operator is looking for — the stack on
 * the counter is what goes out with the goods — and an absent chip reads as
 * "no information" rather than "not yet", especially beside rows that do carry
 * one. So the negative is drawn, quietly.
 *
 * Deliberately not a status badge: `Submitted` and `Amended` are what the
 * record *is*, and this is what has happened to a piece of paper. They sit in
 * the same cell but they are answering different questions, so they do not
 * share a colour — printed is violet, and emerald stays the filing status.
 *
 * The date is a title rather than text. In a list of thirty, "Printed" is the
 * answer; when it was printed is the follow-up question, and it belongs where
 * a follow-up question goes.
 */
export function ChallanPrintMark({ record, className }: ChallanPrintMarkProps) {
  if (!record.printedAt) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-dashed px-2 py-0.5 text-xs font-medium whitespace-nowrap text-muted-foreground',
          className,
        )}
      >
        <Printer className="size-3 shrink-0" aria-hidden />
        Not printed
      </span>
    )
  }

  const printedBy = record.printedBy ? ` by ${record.printedBy.name}` : ''

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-tone-violet/25 bg-tone-violet/10 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-tone-violet',
        className,
      )}
      title={`Printed ${formatDateTime(record.printedAt)}${printedBy}`}
    >
      <PrinterCheck className="size-3 shrink-0" aria-hidden />
      Printed
    </span>
  )
}
