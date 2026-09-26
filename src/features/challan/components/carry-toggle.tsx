import { CarryToggle as SharedCarryToggle } from '@/components/shared/carry-toggle'
import type { CarryControls } from '@/hooks/use-carry-over'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { CARRIED_LABEL_KEYS } from '../lib/carried-fields'
import type { CarriedField } from '../lib/carried-fields'

interface CarryToggleProps {
  carry?: CarryControls<CarriedField>
  field: CarriedField
}

/**
 * One carried field's tick box: what this module calls the field, and the
 * value the last challan left in it. Everything the tick *does* is the shared
 * control in `components/shared/carry-toggle.tsx` and `hooks/use-carry-over.ts`.
 */
export function CarryToggle({ carry, field }: CarryToggleProps) {
  const t = useT()

  if (!carry) {
    return null
  }

  return (
    <SharedCarryToggle
      label={t(CARRIED_LABEL_KEYS[field] as TranslationKey)}
      shown={carry.values[field]?.trim() ?? ''}
      checked={Boolean(carry.kept[field])}
      onToggle={(next) => carry.toggle(field, next)}
      sourceLabel={carry.sourceLabel}
    />
  )
}
