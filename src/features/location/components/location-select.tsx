import { useMemo, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useDistricts, useThanas } from '../hooks/use-locations'
import type { LocationType } from '../types'
import { LocationTypeBadge } from './location-badges'

export interface LocationSelection {
  id: string
  district: string
  thana: string
  locationType: LocationType
}

/**
 * One row of the master list as the combobox carries it.
 *
 * `value` and `label` are the shape Base UI reads without being told how:
 * `label` is what it filters and displays, `value` is what identifies the row.
 * The type rides along, so choosing a thana produces a whole selection rather
 * than an id somebody then has to look up again.
 */
interface ThanaChoice {
  value: string
  label: string
  locationType: LocationType
}

interface LocationSelectProps {
  /** The row currently chosen, so the control can open on it. */
  value: LocationSelection | null
  onChange: (selection: LocationSelection | null) => void
  disabled?: boolean
  /** Ids for the two labels, so a caller can point a description at them. */
  idPrefix?: string
  className?: string
}

/**
 * District, then thana, then the location type falls out.
 *
 * A cascade rather than three fields, because the third is not a field at all:
 * choosing the thana is what decides the type, and a box somebody could type
 * into would let a challan carry a classification the master list disagrees
 * with. So the type is rendered, never entered.
 *
 * Changing the district clears the thana and the type with it. A thana is only
 * meaningful inside a district — Kaliganj is in Gazipur, Satkhira and
 * Jhenaidah — so carrying one across would be how the wrong one gets filed.
 *
 * Both halves search rather than only scroll. There are sixty-four districts
 * and a district can carry fifty thanas, and finding Sirajganj by scrolling
 * past everything alphabetically before it is slower than typing three
 * letters — on a form filled from a stack of paper, several times a minute.
 * Typing filters the list and nothing else: a value can still only come from
 * the master list, so nothing typed can become a selection on its own.
 *
 * Only active rows are offered, because that is all the API returns.
 */
export function LocationSelect({
  value,
  onChange,
  disabled,
  idPrefix = 'location',
  className,
}: LocationSelectProps) {
  const [district, setDistrict] = useState(value?.district ?? '')

  /**
   * Follows the value when a caller fills one in on the subject already on
   * screen — a resolver answering, say.
   *
   * Adjusted during render rather than in an effect: an effect here would
   * paint the previous district for a frame before correcting it, and on a
   * control whose second dropdown depends on the first, that frame is a
   * request for the wrong district's thanas.
   *
   * `seen` is what makes it fire once per incoming value rather than fighting
   * the operator every time they pick a different district themselves — which
   * is also why it deliberately ignores a value going *back* to null. The
   * operator changing district clears the selection, and a reset there would
   * undo the district they just chose.
   *
   * **So switching to a different challan is the caller's job, with a `key`.**
   * There is no way to tell "the subject changed and has no location" from
   * "the operator is midway through choosing" by watching props, and guessing
   * wrong in either direction files the wrong location. Remounting is React's
   * own answer and the only one that resets every piece of this at once.
   */
  const [seen, setSeen] = useState(value?.district ?? '')

  if (value?.district && value.district !== seen) {
    setSeen(value.district)
    setDistrict(value.district)
  }

  const districts = useDistricts(!disabled)
  const thanas = useThanas(district)

  const districtItems = useMemo(() => districts.data ?? [], [districts.data])

  const thanaItems = useMemo<ThanaChoice[]>(
    () =>
      (thanas.data ?? []).map((option) => ({
        value: option.id,
        label: option.thana,
        locationType: option.locationType,
      })),
    [thanas.data],
  )

  /**
   * The caller holds the selection as an id and the combobox wants the row
   * itself. Reading it back out of the list rather than keeping a second copy
   * is what stops the two disagreeing when the district changes underneath.
   */
  const selectedThana = value ? (thanaItems.find((item) => item.value === value.id) ?? null) : null

  const pickDistrict = (next: string | null) => {
    if (next === null) {
      return
    }
    setDistrict(next)
    // The thana and the type go with it: neither means anything under a
    // district they do not belong to.
    onChange(null)
  }

  const pickThana = (choice: ThanaChoice | null) => {
    // The row has to be one this control actually offered. Anything else — a
    // cleared value, a stale row from a district that has since changed — is
    // not a selection, and a selection is the only thing that may be reported.
    if (!choice) {
      return
    }
    onChange({
      id: choice.value,
      district,
      thana: choice.label,
      locationType: choice.locationType,
    })
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-district`} className="text-[13px] font-medium">
            District
          </Label>
          <Combobox
            items={districtItems}
            value={district || null}
            onValueChange={pickDistrict}
            disabled={disabled || districts.isPending}
          >
            <ComboboxTrigger id={`${idPrefix}-district`} className="w-full">
              <MapPin className="size-3.5 text-muted-foreground" aria-hidden />
              <ComboboxValue placeholder={districts.isPending ? 'Loading…' : 'Choose a district'} />
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxInput placeholder="Search districts…" />
              <ComboboxEmpty>No district matches that.</ComboboxEmpty>
              <ComboboxList>
                {(name: string) => (
                  <ComboboxItem key={name} value={name}>
                    {name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-thana`} className="text-[13px] font-medium">
            Thana
          </Label>
          <Combobox
            items={thanaItems}
            value={selectedThana}
            onValueChange={pickThana}
            isItemEqualToValue={(item, current) => item.value === current.value}
            disabled={disabled || !district || thanas.isPending}
          >
            <ComboboxTrigger id={`${idPrefix}-thana`} className="w-full">
              {thanas.isFetching && district ? (
                <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />
              ) : null}
              <ComboboxValue placeholder={district ? 'Choose a thana' : 'Choose a district first'} />
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxInput placeholder="Search thanas…" />
              <ComboboxEmpty>No thana matches that.</ComboboxEmpty>
              <ComboboxList>
                {(option: ThanaChoice) => (
                  <ComboboxItem key={option.value} value={option}>
                    {option.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>

      {/* The third value, shown rather than entered: it belongs to the pair,
          and this is where that becomes visible. */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">Location</span>
        {value ? (
          <LocationTypeBadge value={value.locationType} />
        ) : (
          <span>Set automatically once a thana is chosen.</span>
        )}
      </div>

      {districts.isError && (
        <p className="text-xs text-destructive" role="alert">
          The location list could not be loaded. The challan can still be saved without one.
        </p>
      )}

      {district && !thanas.isPending && thanaItems.length === 0 && (
        <p className="text-xs text-muted-foreground">
          {district} has no active thanas in the location master list.
        </p>
      )}
    </div>
  )
}
