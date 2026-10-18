import { cn } from '@/lib/utils'

interface SegmentedProps<T extends string> {
  label: string
  options: { value: T; label: string }[]
  /** Null when none is in force — a custom date range lights no preset. */
  value: T | null
  onChange: (value: T) => void
  /** The column count on a phone, so the switch never breaks inside itself. */
  columns: 'grid-cols-2' | 'grid-cols-3' | 'grid-cols-4'
}

/**
 * One choice out of a few, drawn as a switch: exactly one is ever in force, which
 * is what a switch says and a row of loose pills did not.
 *
 * Equal columns across a phone, with the label allowed a second line — a Bangla
 * label is longer than its English one, and truncating it would hide which
 * choice is which. Its natural width from `sm`. At least 36px tall either way,
 * so a thumb lands on the one it meant.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  columns,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('grid w-full gap-0.5 rounded-xl bg-muted p-1 sm:inline-flex sm:w-auto', columns)}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'min-h-9 rounded-lg px-2 py-1.5 text-[13px] leading-snug font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3.5 sm:text-sm',
              active
                ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
