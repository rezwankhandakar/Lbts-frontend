import { useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
   * Follows the value when a caller replaces it wholesale — reopening a dialog
   * on a different challan, say.
   *
   * Adjusted during render rather than in an effect. React's own guidance for
   * "reset state when a prop changes" is exactly this shape, and an effect
   * here would paint the previous district for a frame before correcting it —
   * on a control whose second dropdown depends on the first, that frame is a
   * request for the wrong district's thanas.
   *
   * `seen` is what makes it fire once per incoming value rather than fighting
   * the operator every time they pick a different district themselves.
   */
  const [seen, setSeen] = useState(value?.district ?? '')

  if (value?.district && value.district !== seen) {
    setSeen(value.district)
    setDistrict(value.district)
  }

  const districts = useDistricts(!disabled)
  const thanas = useThanas(district)

  const pickDistrict = (next: string | null) => {
    if (next === null) {
      return
    }
    setDistrict(next)
    // The thana and the type go with it: neither means anything under a
    // district they do not belong to.
    onChange(null)
  }

  const pickThana = (id: string | null) => {
    // The row has to be one this control actually offered. Anything else — a
    // cleared value, a stale id from a district that has since changed — is
    // not a selection, and a selection is the only thing that may be reported.
    const option = id ? thanas.data?.find((thana) => thana.id === id) : undefined
    if (!option || !id) {
      return
    }
    onChange({ id, district, thana: option.thana, locationType: option.locationType })
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-district`} className="text-[13px] font-medium">
            District
          </Label>
          <Select
            value={district}
            onValueChange={pickDistrict}
            disabled={disabled || districts.isPending}
          >
            <SelectTrigger id={`${idPrefix}-district`} className="w-full">
              <MapPin className="size-3.5 text-muted-foreground" aria-hidden />
              <SelectValue placeholder={districts.isPending ? 'Loading…' : 'Choose a district'} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(districts.data ?? []).map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-thana`} className="text-[13px] font-medium">
            Thana
          </Label>
          <Select
            value={value?.id ?? ''}
            onValueChange={pickThana}
            disabled={disabled || !district || thanas.isPending}
          >
            <SelectTrigger id={`${idPrefix}-thana`} className="w-full">
              {thanas.isFetching && district ? (
                <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />
              ) : null}
              <SelectValue
                placeholder={district ? 'Choose a thana' : 'Choose a district first'}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(thanas.data ?? []).map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.thana}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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

      {district && !thanas.isPending && (thanas.data ?? []).length === 0 && (
        <p className="text-xs text-muted-foreground">
          {district} has no active thanas in the location master list.
        </p>
      )}
    </div>
  )
}
