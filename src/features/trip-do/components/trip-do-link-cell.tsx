import { Link2, Plus } from 'lucide-react'
import { formatTripDate } from '@/features/gate-pass/lib/gate-pass-meta'
import type { TripDoRowRecord } from '../types'
import { useT } from '@/lib/i18n'

interface TripDoLinkCellProps {
  row: TripDoRowRecord
  canWrite: boolean
  onLink: (row: TripDoRowRecord) => void
}

/**
 * The Trip DO column: the one cell on the sheet somebody fills in.
 *
 * A set Trip DO shows the DO itself large, with the gate pass it belongs to
 * beneath it; pressing it opens the picker to change it. An unset one is a
 * dashed amber button — it is the to-do on the row, and it should look like
 * one — and for a read-only account it says so in words instead.
 */
export function TripDoLinkCell({ row, canWrite, onLink }: TripDoLinkCellProps) {
  const t = useT()

  const link = row.link

  if (link) {
    const content = (
      <>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-tone-emerald/10 text-tone-emerald ring-1 ring-tone-emerald/20">
          <Link2 className="size-3.5" aria-hidden />
        </span>
        <span className="flex min-w-0 flex-col items-start leading-tight">
          <span className="max-w-[9.5rem] truncate font-mono text-[12.5px] font-semibold">
            {link.tripDo}
          </span>
          <span className="text-[10.5px] whitespace-nowrap text-muted-foreground">
            {formatTripDate(link.tripDate)}
          </span>
        </span>
      </>
    )

    const title = `Trip DO ${link.tripDo} · ${link.gatePassNumber} · CSD ${link.csd} · Unit ${link.unit}${
      link.model && link.model !== row.model ? ` · gate pass model ${link.model}` : ''
    }${link.linkedBy ? ` · set by ${link.linkedBy.name}` : ''}`

    return canWrite ? (
      <button
        type="button"
        onClick={() => onLink(row)}
        title={`${title}\nPress to change`}
        className="flex min-w-0 items-center gap-2 rounded-md px-1 py-0.5 text-left outline-none hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {content}
      </button>
    ) : (
      <span className="flex min-w-0 items-center gap-2 px-1" title={title}>
        {content}
      </span>
    )
  }

  if (!canWrite) {
    return <span className="px-1 text-[11.5px] text-muted-foreground italic">{t('tripDo.notSet')}</span>
  }

  return (
    <button
      type="button"
      onClick={() => onLink(row)}
      className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-tone-amber/50 bg-tone-amber/5 px-2 py-1 text-[11.5px] font-medium text-tone-amber transition outline-none hover:border-tone-amber hover:bg-tone-amber/10 focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <Plus className="size-3.5" aria-hidden />
      {t('tripDo.setTripDo')}
    </button>
  )
}
