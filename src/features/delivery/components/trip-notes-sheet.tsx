import { useState } from 'react'
import { Loader2, MessageSquarePlus, Pin, StickyNote, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useFormatters, useT } from '@/lib/i18n'
import { useAddTripNote, useRemoveTripNote } from '../hooks/use-deliveries'
import { MAX_TRIP_NOTES, MAX_TRIP_NOTE_LENGTH } from '../types'
import type { TripNoteRecord, TripRecord } from '../types'

interface TripNotesSheetProps {
  trip: TripRecord
  /** The rule `assertCanChangeTrip` enforces — the role alone, as everywhere here. */
  canChange: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * What people had to say about this run.
 *
 * A log rather than a field, because a trip is worked by several hands over
 * several days and the note the cart carries was written before any of it
 * happened — which is why that one is pinned above the log rather than mixed
 * into it. Each entry keeps its author and its moment; nothing is editable, so
 * correcting a note is removing it and writing the one that was meant.
 *
 * A sheet rather than a dialog: a log is read top to bottom and grows, and a
 * tall panel down the side is the shape of that. The half-typed draft lives
 * inside it, so it is born when the sheet opens and goes when it closes.
 */
export function TripNotesSheet({ trip, canChange, open, onOpenChange }: TripNotesSheetProps) {
  const t = useT()
  const format = useFormatters()

  const notes = trip.notes ?? []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b pr-12">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-tone-violet/10 text-tone-violet ring-1 ring-tone-violet/20">
              <StickyNote className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <SheetTitle>{t('delivery.notes.heading')}</SheetTitle>
              <SheetDescription className="text-xs">{t('delivery.notes.subheading')}</SheetDescription>
            </div>
            {notes.length > 0 && (
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums">
                {format.number(notes.length)}
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {canChange && <NoteComposer trip={trip} full={notes.length >= MAX_TRIP_NOTES} />}

          {trip.note && (
            <div className="rounded-xl border border-tone-amber/25 bg-tone-amber/5 px-3 py-2">
              <p className="flex items-center gap-1 text-[11px] font-semibold text-tone-amber">
                <Pin className="size-3" aria-hidden />
                {t('delivery.summary.tripNote')}
              </p>
              <p className="mt-1 text-sm wrap-break-word whitespace-pre-wrap">{trip.note}</p>
            </div>
          )}

          {notes.length === 0 ? (
            <p className="rounded-xl border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
              {canChange ? t('delivery.notes.emptyWritable') : t('delivery.notes.empty')}
            </p>
          ) : (
            <ol className="space-y-2">
              {notes.map((note) => (
                <NoteRow key={note.id} tripId={trip.id} note={note} canChange={canChange} />
              ))}
            </ol>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function NoteComposer({ trip, full }: { trip: TripRecord; full: boolean }) {
  const t = useT()
  const format = useFormatters()

  const [draft, setDraft] = useState('')
  const add = useAddTripNote()
  const text = draft.trim()

  function submit() {
    if (!text || full) {
      return
    }
    add.mutate({ tripId: trip.id, text }, { onSuccess: () => setDraft('') })
  }

  return (
    <div className="space-y-2">
      <label className="sr-only" htmlFor="trip-note">
        {t('delivery.notes.placeholder')}
      </label>
      <Textarea
        id="trip-note"
        rows={3}
        value={draft}
        maxLength={MAX_TRIP_NOTE_LENGTH}
        disabled={add.isPending || full}
        placeholder={t('delivery.notes.placeholder')}
        onChange={(event) => setDraft(event.target.value)}
        /**
         * Ctrl/⌘ + Enter adds it. A bare Enter stays a newline: these are
         * sentences about a delivery, not chat messages, and somebody writing
         * two lines must not file the first by pressing return.
         */
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            submit()
          }
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {full
            ? t('delivery.notes.full', { max: format.number(MAX_TRIP_NOTES) })
            : `${format.number(draft.length)}/${format.number(MAX_TRIP_NOTE_LENGTH)}`}
        </span>
        <Button type="button" size="sm" disabled={!text || full || add.isPending} onClick={submit}>
          {add.isPending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
          ) : (
            <MessageSquarePlus data-icon="inline-start" aria-hidden />
          )}
          {t('delivery.notes.add')}
        </Button>
      </div>
    </div>
  )
}

function NoteRow({ tripId, note, canChange }: { tripId: string; note: TripNoteRecord; canChange: boolean }) {
  const t = useT()
  const format = useFormatters()

  const remove = useRemoveTripNote()

  return (
    <li className="rounded-xl border bg-muted/40 px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[11px] font-medium text-muted-foreground">
          {note.createdBy?.name ?? t('delivery.notes.removedAccount')}
          <span className="font-normal"> · {format.dateTime(note.createdAt)}</span>
        </p>
        {canChange && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mt-1 -mr-1 size-7 shrink-0 text-muted-foreground hover:text-destructive"
            disabled={remove.isPending}
            aria-label={t('delivery.notes.removeAria')}
            onClick={() => remove.mutate({ tripId, noteId: note.id })}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        )}
      </div>
      <p className="mt-1 text-sm wrap-break-word whitespace-pre-wrap">{note.text}</p>
    </li>
  )
}
