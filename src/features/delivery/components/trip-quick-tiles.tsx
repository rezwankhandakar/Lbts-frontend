import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronRight, PencilLine, ReceiptText, StickyNote } from 'lucide-react'
import { useFormatters, useT } from '@/lib/i18n'
import { BLANK } from '@/lib/format'
import { takaInBanglaWords } from '@/lib/taka-words'
import { cn } from '@/lib/utils'
import type { TripRecord } from '../types'
import { TripBillDialog } from './trip-bill-dialog'
import { TripNotesSheet } from './trip-notes-sheet'

interface TripQuickTilesProps {
  trip: TripRecord
  canChange: boolean
  /** A bill was saved — the page takes the reader back to the bill backlog. */
  onBillSaved?: () => void
}

const TILE = 'group flex w-full items-stretch rounded-xl border bg-card text-left shadow-xs transition outline-none'
const PRESSABLE = 'hover:border-primary/30 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50'

/**
 * The trip's notes and its bill, each one row tall, opened with one press.
 *
 * One row because the head of the page has to fit a laptop screen: the notes
 * strip says how many there are and the latest one, the bill strip says the
 * rent, the labour bill and their total side by side. What a cell has no room
 * for — the Bangla words an amount reads back as — is its tooltip, and the
 * form that writes them shows them in full.
 *
 * The notes strip opens for every reader, because the log is read as well as
 * written. The bill strip opens only for a writer: a reader already sees both
 * figures, and a dialog that could only repeat them is a door to an empty
 * room. A figure nobody has entered says so in amber rather than as a zero,
 * because a blank rent is the one way a trip looks paid when it is not.
 */
export function TripQuickTiles({ trip, canChange, onBillSaved }: TripQuickTilesProps) {
  const t = useT()
  const format = useFormatters()

  const [notesOpen, setNotesOpen] = useState(false)
  const [billOpen, setBillOpen] = useState(false)

  const notes = trip.notes ?? []
  const latest = notes[0] ?? null
  const anyBill = trip.tripRent !== null || trip.labourBill !== null

  const bill = (
    <>
      <span className="hidden items-center px-3 sm:flex">
        <IconTile tile="bg-tone-amber/10 text-tone-amber ring-tone-amber/20">
          <ReceiptText className="size-4" aria-hidden />
        </IconTile>
      </span>
      <Amount label={t('delivery.bill.tripRentShort')} value={trip.tripRent} leading />
      <Amount label={t('delivery.bill.labourBillShort')} value={trip.labourBill} />
      <Amount label={t('delivery.bill.total')} value={anyBill ? trip.billTotal : null} total />
      {canChange && (
        <span className="flex items-center border-l px-3 text-xs font-medium text-primary">
          <PencilLine className="size-3.5" aria-hidden />
          <span className="ms-1 hidden md:inline">{t('delivery.bill.edit')}</span>
        </span>
      )}
    </>
  )

  return (
    <div className="grid gap-2.5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <button
        type="button"
        className={cn(TILE, PRESSABLE, 'items-center gap-3 px-3 py-2')}
        aria-label={t('delivery.hero.openNotes')}
        onClick={() => setNotesOpen(true)}
      >
        <IconTile tile="bg-tone-violet/10 text-tone-violet ring-tone-violet/20">
          <StickyNote className="size-4" aria-hidden />
        </IconTile>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            {t('delivery.notes.heading')}
            {notes.length > 0 && (
              <span className="rounded-full bg-muted px-1.5 py-px text-[11px] font-semibold tabular-nums">
                {format.number(notes.length)}
              </span>
            )}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {latest
              ? `${latest.text} — ${latest.createdBy?.name ?? t('delivery.notes.removedAccount')}`
              : trip.note
                ? `${t('delivery.summary.tripNote')}: ${trip.note}`
                : canChange
                  ? t('delivery.hero.notesWrite')
                  : t('delivery.notes.empty')}
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" aria-hidden />
      </button>

      {canChange ? (
        <button
          type="button"
          className={cn(TILE, PRESSABLE)}
          aria-label={t('delivery.bill.edit')}
          onClick={() => setBillOpen(true)}
        >
          {bill}
        </button>
      ) : (
        <div className={TILE}>{bill}</div>
      )}

      <TripNotesSheet trip={trip} canChange={canChange} open={notesOpen} onOpenChange={setNotesOpen} />
      {canChange && (
        <TripBillDialog trip={trip} open={billOpen} onOpenChange={setBillOpen} onSaved={onBillSaved} />
      )}
    </div>
  )
}

function IconTile({ tile, children }: { tile: string; children: ReactNode }) {
  return (
    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg ring-1', tile)}>{children}</span>
  )
}

function Amount({
  label,
  value,
  total = false,
  leading = false,
}: {
  label: string
  value: number | null
  total?: boolean
  /** The first cell: no rule on its left below `sm`, where the icon is hidden. */
  leading?: boolean
}) {
  const t = useT()
  const format = useFormatters()

  return (
    <span
      className={cn('block min-w-0 flex-1 border-l px-2.5 py-2 sm:px-3', leading && 'border-l-0 sm:border-l')}
      title={value === null ? undefined : takaInBanglaWords(value)}
    >
      <span className="block truncate text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </span>
      {value === null ? (
        <span className={cn('block truncate text-sm font-medium', total ? 'text-muted-foreground' : 'text-tone-amber')}>
          {total ? BLANK : t('delivery.bill.notEntered')}
        </span>
      ) : (
        <span className={cn('block truncate text-base leading-snug font-bold tabular-nums', total && 'text-tone-indigo')}>
          {format.taka(value)}
        </span>
      )}
    </span>
  )
}
