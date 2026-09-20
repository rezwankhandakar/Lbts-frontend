import { Paperclip, RefreshCcw, ScrollText, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useEntryVoucher } from '../hooks/use-entry-voucher'
import { KIND_META, describeEntry, formatDay, taka } from '../lib/accounts-meta'
import type { EntryRecord } from '../types'
import { KindIcon } from './account-atoms'
import { EntryActionsMenu } from './entry-actions-menu'
import { VoucherViewerDialog } from './voucher-viewer-dialog'

interface EntryListProps {
  records: EntryRecord[]
  isLoading: boolean
  errorMessage: string | null
  onRetry: () => void
  canWrite: boolean
  /** A wallet's statement, so a transfer reads as money in or out of it. */
  walletId?: string
  emptyTitle?: string
  emptyDescription?: string
  /** Always the card layout, for a list in a narrow column. */
  compact?: boolean
}

function signedAmount(entry: EntryRecord, walletId?: string): { text: string; className: string } {
  const meta = KIND_META[entry.kind]
  if (entry.kind === 'Transfer' && walletId) {
    const incoming = entry.toWallet?.id === walletId
    return {
      text: `${incoming ? '+' : '−'}${taka(entry.amount)}`,
      className: incoming ? 'text-tone-emerald' : 'text-tone-rose',
    }
  }
  return { text: `${meta.sign}${taka(entry.amount)}`, className: meta.amount }
}

/**
 * The paperclip that opens an entry's voucher.
 *
 * Drawn only when there is one — unlike a status badge on a row, where an
 * absent chip would read as "no information". Here it is an action, and an
 * action with nothing behind it is a button that does nothing.
 *
 * It sits outside `EntryActionsMenu` deliberately: that menu is drawn only for
 * a role that may write, and reading the paper behind the books is a read. A
 * `CEO` opens a voucher and cannot attach or remove one.
 */
function VoucherButton({ entry, onOpen }: { entry: EntryRecord; onOpen: (entry: EntryRecord) => void }) {
  if (!entry.voucher) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      title="Voucher attached"
      aria-label={`Open the voucher for ${entry.entryNumber}`}
      onClick={() => onOpen(entry)}
    >
      <Paperclip aria-hidden />
    </Button>
  )
}

/**
 * Entries, newest first: a table from md up, one card per entry below it. Both
 * read off the same `describeEntry`, so the two can never say different things.
 */
export function EntryList({
  records,
  isLoading,
  errorMessage,
  onRetry,
  canWrite,
  walletId,
  emptyTitle = 'No entries yet',
  emptyDescription = 'Money added, spent, advanced or paid shows up here.',
  compact = false,
}: EntryListProps) {
  const viewer = useEntryVoucher()

  if (isLoading) {
    return (
      <div className="grid gap-2 p-4" aria-busy="true">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-14 rounded-lg" />
        ))}
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
        <TriangleAlert className="size-5 text-destructive" aria-hidden />
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCcw data-icon="inline-start" aria-hidden />
          Try again
        </Button>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <ScrollText className="size-5" aria-hidden />
        </span>
        <p className="mt-2 text-sm font-medium">{emptyTitle}</p>
        <p className="max-w-sm text-xs text-muted-foreground">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <>
      <table className={cn('hidden w-full text-sm', !compact && 'md:table')}>
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Date</th>
            <th className="px-2 py-2.5 font-medium">Entry</th>
            <th className="px-2 py-2.5 font-medium">Wallet</th>
            <th className="px-2 py-2.5 text-right font-medium">Amount</th>
            <th className="w-20 px-2 py-2.5" aria-label="Actions" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {records.map((entry) => {
            const { title, detail } = describeEntry(entry)
            const amount = signedAmount(entry, walletId)
            return (
              <tr key={entry.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 align-top whitespace-nowrap">
                  <p className="font-medium tabular-nums">{formatDay(entry.date)}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{entry.entryNumber}</p>
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-3">
                    <KindIcon kind={entry.kind} className="size-8" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {KIND_META[entry.kind].label}
                        {detail && ` · ${detail}`}
                        {entry.reference && ` · Ref ${entry.reference}`}
                      </p>
                      {entry.note && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground/80 italic">{entry.note}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-3 text-xs whitespace-nowrap text-muted-foreground">
                  {entry.kind === 'AdvanceAdjust' ? 'No cash moved' : entry.wallet?.name}
                </td>
                <td className={cn('px-2 py-3 text-right font-semibold whitespace-nowrap tabular-nums', amount.className)}>
                  {amount.text}
                </td>
                <td className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <VoucherButton entry={entry} onOpen={viewer.open} />
                    <div className="flex shrink-0 items-center gap-0.5">
                <VoucherButton entry={entry} onOpen={viewer.open} />
                {canWrite && <EntryActionsMenu entry={entry} />}
              </div>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <ul className={cn('divide-y', !compact && 'md:hidden')}>
        {records.map((entry) => {
          const { title, detail } = describeEntry(entry)
          const amount = signedAmount(entry, walletId)
          return (
            <li key={entry.id} className="flex items-start gap-3 px-4 py-3">
              <KindIcon kind={entry.kind} className="mt-0.5 size-8" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium">{title}</p>
                  <p className={cn('shrink-0 text-sm font-semibold tabular-nums', amount.className)}>{amount.text}</p>
                </div>
                {detail && <p className="truncate text-xs text-muted-foreground">{detail}</p>}
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {formatDay(entry.date)} · {entry.kind === 'AdvanceAdjust' ? 'No cash' : entry.wallet?.name} · {entry.entryNumber}
                </p>
              </div>
              {canWrite && <EntryActionsMenu entry={entry} />}
            </li>
          )
        })}
      </ul>

      <VoucherViewerDialog
        entry={viewer.entry}
        url={viewer.url}
        blob={viewer.blob}
        mimeType={viewer.mimeType}
        isLoading={viewer.isLoading}
        error={viewer.error}
        onClose={viewer.close}
        onDownload={() => {
          if (viewer.entry?.voucher) {
            void viewer.download(viewer.entry.voucher, `${viewer.entry.entryNumber}.pdf`)
          }
        }}
      />
    </>
  )
}
