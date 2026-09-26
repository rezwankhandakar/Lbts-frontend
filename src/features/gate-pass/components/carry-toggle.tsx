import { CarryToggle as SharedCarryToggle } from '@/components/shared/carry-toggle'
import type { CarryControls } from '@/hooks/use-carry-over'
import { CARRIED_LABEL_KEYS } from '../lib/carried-fields'
import type { CarriedField } from '../lib/carried-fields'
import { formatTripDate } from '../lib/gate-pass-meta'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'

interface CarryToggleProps {
  carry?: CarryControls<CarriedField>
  field: CarriedField
}

/**
 * One carried field's tick box: what this module calls the field, and how its
 * value reads to a person. Everything the tick *does* is the shared control in
 * `components/shared/carry-toggle.tsx` and `hooks/use-carry-over.ts`.
 */
export function CarryToggle({ carry, field }: CarryToggleProps) {
  const t = useT()

  if (!carry) {
    return null
  }

  const previous = carry.values[field]?.trim() ?? ''

  return (
    <SharedCarryToggle
      label={t(CARRIED_LABEL_KEYS[field] as TranslationKey)}
      // A date is stored as YYYY-MM-DD and read as a day. The box below it is
      // a date input, which draws its own format; this is the one a person
      // reads.
      shown={field === 'tripDate' ? formatTripDate(previous) : previous}
      checked={Boolean(carry.kept[field])}
      onToggle={(next) => carry.toggle(field, next)}
      sourceLabel={carry.sourceLabel}
    />
  )
}
