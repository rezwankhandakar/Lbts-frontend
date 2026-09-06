import { useState } from 'react'
import { CircleCheck, Info, Loader2, MapPin, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LocationTypeBadge } from '@/features/location/components/location-badges'
import { LocationSelect } from '@/features/location/components/location-select'
import type { LocationSelection } from '@/features/location/components/location-select'
import { useLocationResolution } from '@/features/location/hooks/use-locations'
import { useDebouncedValue } from '@/hooks/use-debounced-value'

interface ChallanLocationPanelProps {
  /** The transcribed text, live. Debounced here before anything is asked. */
  thana: string
  district: string
  deliveryAddress: string
  /** The row the operator picked, if they picked one. */
  locationId: string
  onPickLocation: (id: string) => void
  disabled?: boolean
}

/**
 * What the transcribed thana, district and address resolve to — and a way to
 * settle it by hand when they do not.
 *
 * The wording throughout is doing real work, so it is worth stating what it is
 * for. This is an **optional** field on a form somebody is filling in at
 * speed. "Could not be determined" must not read as an error, because it is
 * not one: the challan files, the barcode generates, the batch completes, and
 * an administrator sets the location later. An alarming panel here would have
 * operators inventing a district to make it go away, which is the exact
 * outcome the whole feature exists to prevent.
 *
 * Three things keep the lookup off the critical path:
 *
 * - the text is **debounced** before anything is asked, so typing costs
 *   nothing;
 * - the answer is **cached** by the query key, so the same district typed
 *   fifteen times in one PDF is one request;
 * - a manual choice **switches it off entirely**. Nothing re-resolves over a
 *   person's decision, here or on the server.
 */
export function ChallanLocationPanel({
  thana,
  district,
  deliveryAddress,
  locationId,
  onPickLocation,
  disabled,
}: ChallanLocationPanelProps) {
  const [picking, setPicking] = useState(false)
  const [picked, setPicked] = useState<LocationSelection | null>(null)

  // 700ms: long enough that typing a district never fires a request, short
  // enough that the answer is there by the time the next field is filled in.
  const settled = useDebouncedValue(
    JSON.stringify({ thana, district, deliveryAddress }),
    700,
  )
  const args = JSON.parse(settled) as {
    thana: string
    district: string
    deliveryAddress: string
  }

  const hasText = Boolean(
    args.thana.trim() || args.district.trim() || args.deliveryAddress.trim(),
  )
  const resolution = useLocationResolution(args, !disabled && !locationId && hasText)

  const chosen = locationId ? picked : null
  const resolved = resolution.data?.resolved ?? null

  const clearChoice = () => {
    setPicked(null)
    onPickLocation('')
  }

  const choose = (selection: LocationSelection | null) => {
    setPicked(selection)
    onPickLocation(selection?.id ?? '')
    if (selection) {
      setPicking(false)
    }
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0">
            <p className="text-[13px] font-medium">
              Location
              <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                Optional
              </span>
            </p>

            <div className="mt-1 min-h-5 text-xs text-muted-foreground" aria-live="polite">
              {chosen ? (
                <span className="flex flex-wrap items-center gap-1.5 text-foreground">
                  <CircleCheck className="size-3.5 text-tone-emerald" aria-hidden />
                  {chosen.district} / {chosen.thana}
                  <LocationTypeBadge value={chosen.locationType} />
                  <span className="text-muted-foreground">— chosen</span>
                </span>
              ) : resolution.isFetching ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Checking the location master list…
                </span>
              ) : resolved ? (
                <span className="flex flex-wrap items-center gap-1.5 text-foreground">
                  <CircleCheck className="size-3.5 text-tone-emerald" aria-hidden />
                  {resolved.district} / {resolved.thana}
                  <LocationTypeBadge value={resolved.locationType} />
                  <span className="text-muted-foreground">— from the master list</span>
                </span>
              ) : !hasText ? (
                <span>Filled in automatically from the thana, district or address above.</span>
              ) : resolution.isError ? (
                <span>
                  The lookup could not run. The challan can still be filed; the location can be
                  set later.
                </span>
              ) : (
                <span>
                  {resolution.data?.message ??
                    'Not determined yet. This challan can still be filed.'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {!locationId && hasText && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || resolution.isFetching}
              onClick={() => void resolution.refetch()}
            >
              <RefreshCcw data-icon="inline-start" aria-hidden />
              Check again
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => (locationId ? clearChoice() : setPicking((open) => !open))}
          >
            {locationId ? 'Clear' : picking ? 'Close' : 'Choose'}
          </Button>
        </div>
      </div>

      {picking && !locationId && (
        <div className="mt-3 border-t pt-3">
          <LocationSelect
            value={picked}
            onChange={choose}
            disabled={disabled}
            idPrefix="challan-location"
          />
        </div>
      )}

      {/* Said once, plainly, and never as a warning: an unresolved location is
          a normal outcome and not a reason to hold up a challan. */}
      <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
        <Info className="mt-px size-3 shrink-0" aria-hidden />
        A challan files whether or not this is set. The thana and district you typed are stored
        exactly as they are either way.
      </p>
    </div>
  )
}
