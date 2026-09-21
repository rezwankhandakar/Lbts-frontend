import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface CarryToggleProps {
  /** What the field is called, for the name a screen reader announces. */
  label: string
  /**
   * The carried value as a person reads it — a date already formatted, say.
   * Nothing is drawn when it is empty: a tick that fills in an empty string is
   * a control with nothing behind it.
   */
  shown: string
  checked: boolean
  onToggle: (next: boolean) => void
  /** The record the value came from, named in the accessible label. */
  sourceLabel?: string | null
}

/**
 * The last record's value, shown above the field it belongs to, with the tick
 * that puts it in.
 *
 * Sits on the label row rather than under the control, where the error and the
 * hint already are — so what is read top to bottom is: what this field is,
 * what it held last time, and then the box itself.
 *
 * The rule it draws is `hooks/use-carry-over.ts`: shown and not filled in,
 * ticked to put it in, unticked to take it out, and editable either way — so
 * correcting what the tick put in simply puts the tick out.
 */
export function CarryToggle({ label, shown, checked, onToggle, sourceLabel }: CarryToggleProps) {
  if (shown.trim().length === 0) {
    return null
  }

  return (
    <label
      className={cn(
        'flex min-w-0 flex-1 cursor-pointer items-center justify-end gap-1.5 text-[11px] leading-none',
        checked ? 'text-primary' : 'text-muted-foreground',
      )}
      title={`${label} on the last one: ${shown}`}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(next) => onToggle(next === true)}
        aria-label={`Use the ${label.toLowerCase()} from the last one${
          sourceLabel ? ` (${sourceLabel})` : ''
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
