import { CircleDashed, Download, FileSignature, Loader2, Printer, Warehouse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import type { Translator } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { LabourBillRecord, LabourSignedCopySection } from '../types'
import { useLabourSignedCopies } from '../hooks/use-labour-bill-signed-copies'

interface SignedCopiesDialogProps {
  bill: LabourBillRecord
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** "3 signed copies" — a counted noun, so it is a message rather than a join. */
function copies(count: number, t: Translator): string {
  return t('labourBill.copies.count', { count, n: formatNumber(count) })
}

/** "2 challans", the same way. */
function challans(count: number, t: Translator): string {
  return t('labourBill.stats.challanCount', { count, n: formatNumber(count) })
}

/**
 * Printing the paper behind the bill — the whole month, or one CSD section.
 *
 * **It asks first**, for the reason Gate Pass's export dialog does: this is the
 * most expensive read in the module and the file it produces is defined by what
 * has come back off lorries rather than by anything on screen. So the dialog
 * reads that back — how many challans have their copy, how many are still
 * waiting — before a byte moves.
 *
 * The section rows are the point rather than a convenience. A labour bill is
 * one month and **as many bills as there were CSDs in it**, and each of those
 * goes to Walton on its own; the copies that belong with one are that section's
 * copies. It is also the way out of a month too large to merge in one file,
 * which is what the refusal tells somebody to do.
 *
 * Nothing here is gated on writing. Printing what already exists changes no
 * record, so a CEO who may not type a labour amount may still print the paper —
 * the rule the challan print mark draws the opposite way round precisely
 * because that one *is* a write.
 */
export function SignedCopiesDialog({ bill, open, onOpenChange }: SignedCopiesDialogProps) {
  const t = useT()

  const { list, isLoading, busy, isBusy, print, download } = useLabourSignedCopies()

  const sections = (list?.sections ?? []).filter((section) => section.challans.length > 0)
  const hasCopies = (list?.copyCount ?? 0) > 0
  const overMax = (list?.copyCount ?? 0) > (list?.maxPerDownload ?? Infinity)

  const summary = () => {
    if (isLoading) {
      return t('labourBill.details.readingBack')
    }
    if (!list || list.challanCount === 0) {
      return t('labourBill.copies.nothingToPrint')
    }
    const values = {
      copies: copies(list.copyCount, t),
      withCopy: formatNumber(list.withCopy),
      challans: challans(list.challanCount, t),
      period: bill.periodLabel,
    }
    return list.withoutCopy > 0
      ? t('labourBill.copies.summaryWaiting', {
          ...values,
          waiting: formatNumber(list.withoutCopy),
        })
      : t('labourBill.copies.summary', values)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isBusy && onOpenChange(next)}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('labourBill.copies.title', { bill: bill.billNumber })}</DialogTitle>
          <DialogDescription>{summary()}</DialogDescription>
        </DialogHeader>

        {list && list.challanCount > 0 && (
          <div className="space-y-2">
            {sections.map((section) => (
              <SectionRow
                key={section.key || 'pending'}
                section={section}
                busy={busy}
                disabled={isBusy}
                onPrint={() => print(section.key)}
                onDownload={() => download(section.key)}
              />
            ))}

            {overMax && (
              <p className="rounded-lg border border-tone-amber/30 bg-tone-amber/5 px-3 py-2 text-xs text-pretty">
                {t('labourBill.copies.overMax', {
                  copies: copies(list.copyCount, t),
                  max: formatNumber(list.maxPerDownload),
                })}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" disabled={isBusy} onClick={() => onOpenChange(false)}>
            {t('common.actions.close')}
          </Button>

          <span className="flex gap-2">
            <Button
              variant="outline"
              disabled={!hasCopies || isBusy || overMax}
              onClick={() => download()}
            >
              <Download data-icon="inline-start" aria-hidden />
              {t('labourBill.copies.downloadAll')}
            </Button>
            <Button disabled={!hasCopies || isBusy || overMax} onClick={() => print()}>
              {busy === 'all' ? (
                <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />
              ) : (
                <Printer data-icon="inline-start" aria-hidden />
              )}
              {busy === 'all' ? t('labourBill.copies.collecting') : t('labourBill.copies.printAll')}
            </Button>
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface SectionRowProps {
  section: LabourSignedCopySection
  busy: string | null
  disabled: boolean
  onPrint: () => void
  onDownload: () => void
}

/** One CSD's own bill, and the paper that goes with it. */
function SectionRow({ section, busy, disabled, onPrint, onDownload }: SectionRowProps) {
  const t = useT()

  const Icon = section.isPending ? CircleDashed : Warehouse
  const isBusy = busy === section.key
  const empty = section.copyCount === 0

  const line = () => {
    if (empty) {
      return t('labourBill.copies.noneYet', {
        count: section.challans.length,
        n: formatNumber(section.challans.length),
      })
    }
    const values = {
      copies: copies(section.copyCount, t),
      withCopy: formatNumber(section.withCopy),
      challans: challans(section.challans.length, t),
    }
    return section.withoutCopy > 0
      ? t('labourBill.copies.sectionSummaryWaiting', {
          ...values,
          waiting: formatNumber(section.withoutCopy),
        })
      : t('labourBill.copies.sectionSummary', values)
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2.5',
        section.isPending ? 'border-tone-amber/30 bg-tone-amber/5' : 'bg-muted/30',
      )}
    >
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'flex items-center gap-1.5 text-sm font-semibold',
            section.isPending && 'text-tone-amber',
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          {section.label}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{line()}</span>
      </span>

      <Button
        variant="ghost"
        size="sm"
        disabled={empty || disabled}
        onClick={onDownload}
        aria-label={t('labourBill.copies.downloadAria', { section: section.label })}
      >
        <Download data-icon="inline-start" aria-hidden />
        {t('common.actions.save')}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={empty || disabled}
        onClick={onPrint}
        aria-label={t('labourBill.copies.printAria', { section: section.label })}
      >
        {isBusy ? (
          <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />
        ) : (
          <FileSignature data-icon="inline-start" aria-hidden />
        )}
        {isBusy ? t('labourBill.copies.collecting') : t('labourBill.copies.print')}
      </Button>
    </div>
  )
}
