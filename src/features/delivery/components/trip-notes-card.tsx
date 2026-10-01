import { useState } from 'react'
import { Loader2, MessageSquarePlus, StickyNote, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAddTripNote, useRemoveTripNote } from '../hooks/use-deliveries'
import { MAX_TRIP_NOTES, MAX_TRIP_NOTE_LENGTH } from '../types'
import type { TripNoteRecord, TripRecord } from '../types'
import { useFormatters, useT } from '@/lib/i18n'

interface TripNotesCardProps {
  trip: TripRecord
  /** The rule `assertCanChangeTrip` enforces — the role alone, as everywhere here. */
  canChange: boolean
}

/**
 * What people had to say about this run.
 *
 * A log rather than a field, because a trip is worked by several hands over
 * several days and the note the cart carries was written before any of it
 * happened. Each entry keeps its author and its moment; nothing is editable,
 * so correcting a note is removing it and writing the one that was meant.
 *
 * Drawn whatever the trip's status, for the reason the bill card is: most of
 * what is worth writing down about a run is written after the lorry is back.
 *
 * Mount keyed on the trip id — the half-typed draft belongs to one trip.
 */
export function TripNotesCard({ trip, canChange }: TripNotesCardProps) {
  const t = useT()
  const format = useFormatters()

  const [draft, setDraft] = useState('')
  const add = useAddTripNote()
  const remove = useRemoveTripNote()

  const notes = trip.notes ?? []
  const text = draft.trim()
  const full = notes.length >= MAX_TRIP_NOTES
  const busy = add.isPending || remove.isPending

  function submit() {
    if (!text || full) {
      return
    }
    add.mutate({ tripId: trip.id, text }, { onSuccess: () => setDraft('') })
  }

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-tone-violet/10 text-tone-violet ring-1 ring-tone-violet/20">
          <StickyNote className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold tracking-tight">{t('delivery.notes.heading')}</h2>
          <p className="text-xs text-muted-foreground">{t('delivery.notes.subheading')}</p>
        </div>
        {notes.length > 0 && (
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums">
            {format.number(notes.length)}
          </span>
        )}
      </div>

      {canChange && (
        <div className="space-y-2">
          <label className="sr-only" htmlFor="trip-note">
            {t('delivery.notes.placeholder')}
          </label>
          <Textarea
            id="trip-note"
            rows={3}
            value={draft}
            maxLength={MAX_TRIP_NOTE_LENGTH}
            disabled={busy || full}
            placeholder={t('delivery.notes.placeholder')}
            onChange={(event) => setDraft(event.target.value)}
            /**
             * Ctrl/⌘ + Enter adds it. A bare Enter stays a newline: these are
             * sentences about a delivery, not chat messages, and somebody
             * writing two lines must not file the first by pressing return.
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
            <Button type="button" size="sm" disabled={!text || full || busy} onClick={submit}>
              {add.isPending ? (
                <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
              ) : (
                <MessageSquarePlus data-icon="inline-start" aria-hidden />
              )}
              {t('delivery.notes.add')}
            </Button>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
          {canChange ? t('delivery.notes.emptyWritable') : t('delivery.notes.empty')}
        </p>
      ) : (
        <ol className="space-y-2">
          {notes.map((note) => (
            <NoteRow
              key={note.id}
              note={note}
              canChange={canChange}
              busy={busy}
              onRemove={() => remove.mutate({ tripId: trip.id, noteId: note.id })}
            />
          ))}
        </ol>
      )}
    </section>
  )
}

function NoteRow({
  note,
  canChange,
  busy,
  onRemove,
}: {
  note: TripNoteRecord
  canChange: boolean
  busy: boolean
  onRemove: () => void
}) {
  const t = useT()
  const format = useFormatters()

  return (
    <li className="group rounded-lg border bg-muted/40 px-3 py-2">
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
            disabled={busy}
            aria-label={t('delivery.notes.removeAria')}
            onClick={onRemove}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        )}
      </div>
      <p className="mt-1 text-sm break-words whitespace-pre-wrap">{note.text}</p>
    </li>
  )
}
