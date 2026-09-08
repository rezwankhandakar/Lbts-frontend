import { useState } from 'react'
import { Loader2, MapPin, SkipForward, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'
import { LocationSelect } from '@/features/location/components/location-select'
import type { LocationSelection } from '@/features/location/components/location-select'
import {
  LocationReviewBadge,
  LocationTypeBadge,
} from '@/features/location/components/location-badges'
import { locationSourceLabel } from '@/features/location/lib/location-meta'
import { isReviewableLocation } from '@/features/location/types'
import type { ChallanRecord } from '../types'

interface ChallanLocationEditorProps {
  record: ChallanRecord
  isPending: boolean
  /** Sets the location, or clears it with `null`. */
  onSubmit: (locationId: string | null) => void
  onCancel: () => void
  /** Moves to the next one in a run without writing. Absent when there is none. */
  onSkip?: () => void
}

/**
 * Reading what a challan says about where it went, and deciding it.
 *
 * **Mount this keyed on the record id.** Every piece of state here belongs to
 * one challan — the half-made selection, the district the cascade is open on —
 * and stepping through a run reuses this component for the next record. A key
 * is React's own answer to "reset state when the subject changes", and it is
 * the only one that resets *all* of it: without one, the second challan opens
 * holding the first one's district, which is exactly how a delivery to
 * Bandarban gets filed in Cumilla.
 *
 * It answers two jobs that look the same and are not. **Setting** a location is
 * choosing, on a challan where the resolver declined — the common case, and
 * the reason a blank location is a workable outcome rather than a failure.
 * **Confirming** one is reading what the resolver inferred and agreeing with
 * it, which is the job nobody would otherwise do: a wrong district on a filed
 * challan is invisible to every list, report and total downstream, so the only
 * thing that catches one is a person comparing it against the transcribed text
 * beside it. Confirming writes the same row back by hand, which is what takes
 * the record out of the review queue — there is no separate "reviewed" flag,
 * because the record already says who decided a location and a second field
 * could disagree with it.
 *
 * Two things are said out loud because operators would otherwise reasonably
 * assume the opposite. **The challan text does not change** — the thana and
 * district as transcribed stay exactly as they were typed, because what the
 * paper said is a fact about the paper. And **the document is not
 * regenerated**: the back page prints that transcribed text, which this does
 * not touch, so nothing already printed becomes untrue and there is nothing to
 * reprint.
 */
export function ChallanLocationEditor({
  record,
  isPending,
  onSubmit,
  onCancel,
  onSkip,
}: ChallanLocationEditorProps) {
  const resolved = record.resolvedLocation

  /**
   * Opens on whatever the record already has, so "change the thana, keep the
   * district" is two clicks rather than five — and so confirming an inferred
   * match is one click with nothing to re-enter.
   */
  const [selection, setSelection] = useState<LocationSelection | null>(
    resolved
      ? {
          id: resolved.masterId,
          district: resolved.district,
          thana: resolved.thana,
          locationType: resolved.locationType,
        }
      : null,
  )

  const needsCheck = isReviewableLocation(resolved)

  /**
   * Whether the primary button would agree with what is already on the record
   * rather than change it. That is the whole difference between the two jobs,
   * and it is what the button is allowed to call itself.
   */
  const isSameRow = selection !== null && resolved !== null && selection.id === resolved.masterId
  const alreadyDecided = isSameRow && resolved.source === 'admin_manual'

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start xl:gap-6">
      <section
        aria-label="What the challan says"
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        <header className="border-b bg-muted/30 px-4 py-3">
          <h2 className="text-[13px] font-semibold tracking-tight">As transcribed</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Exactly what was typed off the challan. Never rewritten by a location, and this is
            what the printed back page carries.
          </p>
        </header>

        <dl className="divide-y">
          <TranscribedRow label="Thana" value={record.thana} />
          <TranscribedRow label="District" value={record.district} />
          <TranscribedRow label="Delivery address" value={record.deliveryAddress} multiline />
          {record.zonePo && <TranscribedRow label="Zone / PO" value={record.zonePo} />}
          <TranscribedRow label="Customer" value={record.customerName} />
        </dl>
      </section>

      <div className="space-y-4">
        {/* What the system decided and on what basis, above the control that
            overrules it. An inferred match is usually right; the point of
            showing the basis is that "matched the nearest master entry" and
            "matched the master list exactly" ask for very different amounts of
            attention from whoever is reading the address on the left. */}
        {resolved && (
          <section
            aria-label="What the system decided"
            className={
              needsCheck
                ? 'overflow-hidden rounded-xl border border-tone-orange/30 bg-tone-orange/5 shadow-sm'
                : 'overflow-hidden rounded-xl border bg-card shadow-sm'
            }
          >
            <div className="px-4 py-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" aria-hidden />
                <span className="text-sm font-semibold">
                  {resolved.district} / {resolved.thana}
                </span>
                <LocationTypeBadge value={resolved.locationType} />
                {needsCheck && <LocationReviewBadge source={resolved.source} />}
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {locationSourceLabel(resolved.source)}
                {resolved.source === 'admin_manual'
                  ? resolved.resolvedBy
                    ? ` by ${resolved.resolvedBy.name}`
                    : ''
                  : ` · ${Math.round(resolved.confidence * 100)}% confident`}{' '}
                · {formatDateTime(resolved.resolvedAt)}
              </p>

              {needsCheck && (
                <p className="mt-2.5 flex items-start gap-2 text-xs leading-relaxed font-medium text-tone-orange">
                  <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  <span>
                    Nobody has confirmed this. Check it against the transcribed thana, district and
                    address, then confirm it or choose the right one.
                  </span>
                </p>
              )}
            </div>
          </section>
        )}

        <section
          aria-label="Choose the location"
          className="overflow-hidden rounded-xl border bg-card shadow-sm"
        >
          <header className="border-b bg-muted/30 px-4 py-3">
            <h2 className="text-[13px] font-semibold tracking-tight">
              {resolved ? 'Change it, or confirm what is there' : 'Choose the location'}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The district and thana come from the master list, and the location type follows from
              the pair.
            </p>
          </header>

          <div className="p-4">
            <LocationSelect
              value={selection}
              onChange={setSelection}
              disabled={isPending}
              idPrefix="challan-location"
            />
          </div>

          <footer className="flex flex-wrap items-center gap-2 border-t bg-muted/20 px-4 py-3">
            {resolved !== null && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                disabled={isPending}
                onClick={() => onSubmit(null)}
              >
                Clear location
              </Button>
            )}

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {/* Leaving one undecided has to be as easy as deciding it. Anybody
                  who cannot tell from the address is meant to move on rather
                  than guess, which is the rule the resolver itself follows. */}
              {onSkip ? (
                <Button type="button" variant="outline" disabled={isPending} onClick={onSkip}>
                  <SkipForward data-icon="inline-start" aria-hidden />
                  Skip
                </Button>
              ) : (
                <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
                  Cancel
                </Button>
              )}

              <Button
                type="button"
                disabled={isPending || !selection || alreadyDecided}
                onClick={() => selection && onSubmit(selection.id)}
              >
                {isPending && (
                  <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
                )}
                {isSameRow ? 'Confirm location' : resolved ? 'Change location' : 'Set location'}
              </Button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  )
}

/**
 * One transcribed value.
 *
 * An em dash rather than an empty cell where there is nothing: a blank reads
 * as a rendering fault, and "the challan did not say" is the single most
 * useful fact on this page — it is usually the reason the location could not
 * be resolved in the first place.
 */
function TranscribedRow({
  label,
  value,
  multiline,
}: {
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <div className="grid gap-0.5 px-4 py-3 sm:grid-cols-[9rem_1fr] sm:gap-3">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd
        className={
          value
            ? multiline
              ? 'text-[13px] leading-relaxed text-pretty'
              : 'text-[13px] font-medium'
            : 'text-[13px] text-muted-foreground'
        }
      >
        {value || '—'}
      </dd>
    </div>
  )
}
