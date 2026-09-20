import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { CARRIED_LABELS } from '../lib/carried-fields'
import type { CarriedField, CarryControls } from '../lib/carried-fields'
import { formatTripDate } from '../lib/gate-pass-meta'

interface CarryToggleProps {
  carry?: CarryControls
  field: CarriedField
}

/**
 * The last gate pass's value, shown above the field it belongs to, with the
 * tick box that puts it in.
 *
 * The value is *shown* and not filled in: an empty box is honest about the
 * fact that nothing has been entered for this sheet yet, where a pre-filled
 * one looks exactly like a value somebody has already checked. Ticking is the
 * deliberate act that says "this sheet too" — and unticking empties the field
 * again, because what was there was never this sheet's own value.
 *
 * Nothing is drawn when there is no previous gate pass, or when it left this
 * field blank: a tick box that fills in an empty string is a control with
 * nothing behind it.
 */
export function CarryToggle({ carry, field }: CarryToggleProps) {
  const previous = carry?.values?.[field]?.trim() ?? ''
  if (!carry || previous.length === 0) {
    return null
  }

  const checked = Boolean(carry.kept[field])
  // A date is stored as YYYY-MM-DD and read as a day. The box below it is a
  // date input, which draws its own format; this is the one a person reads.
  const shown = field === 'tripDate' ? formatTripDate(previous) : previous

  return (
    <label
      className={cn(
        'flex min-w-0 flex-1 cursor-pointer items-center justify-end gap-1.5 text-[11px] leading-none',
        checked ? 'text-primary' : 'text-muted-foreground',
      )}
      title={`${CARRIED_LABELS[field]} on the last gate pass: ${shown}`}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(next) => carry.toggle(field, next === true)}
        aria-label={`Use the ${CARRIED_LABELS[field].toLowerCase()} from the last gate pass${
          carry.gatePassId ? ` (${carry.gatePassId})` : ''
        }: ${shown}`}
        className="size-3.5 shrink-0"
      />
      <span className="shrink-0">Same as last:</span>
      <span className={cn('min-w-0 truncate font-medium', !checked && 'text-foreground')}>
        {shown}
      </span>
    </label>
  )
}
