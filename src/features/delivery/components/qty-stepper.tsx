import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface QtyStepperProps {
  value: number
  onChange: (value: number) => void
  /** What the line is, for the screen reader: "Refrigerator WFN-1D5". */
  label: string
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

/**
 * A quantity with a button either side.
 *
 * The buttons are the ordinary path — trimming four refrigerators to three is
 * one press — and the number itself is typeable for the rare line of forty.
 * What is typed is held locally until it is a whole number, so clearing the box
 * to retype does not snap it to 1 under somebody's fingers.
 *
 * On a phone it is drawn larger — 40px buttons rather than 28px, which is the
 * difference between a thumb pressing "−" and pressing the menu beside it —
 * and the number is 16px, because iOS zooms the whole page into any field set
 * smaller than that the moment it is tapped.
 */
export function QtyStepper({
  value,
  onChange,
  label,
  min = 1,
  max = 100000,
  disabled,
  className,
}: QtyStepperProps) {
  const t = useT()

  const [draft, setDraft] = useState<string | null>(null)

  const commit = (raw: string) => {
    const parsed = Number.parseInt(raw, 10)
    if (Number.isFinite(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)))
    }
    setDraft(null)
  }

  return (
    <div
      className={cn(
        'inline-flex h-10 items-center rounded-lg border bg-background shadow-xs sm:h-8',
        disabled && 'opacity-60',
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-10 rounded-r-none sm:size-7"
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
        aria-label={t('delivery.line.oneFewer', { label })}
      >
        <Minus aria-hidden />
      </Button>

      <input
        type="text"
        inputMode="numeric"
        value={draft ?? String(value)}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value.replace(/\D/g, ''))}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit(event.currentTarget.value)
          }
        }}
        aria-label={t('delivery.line.qtyOf', { label })}
        className="h-full w-12 border-x bg-transparent text-center text-base font-semibold tabular-nums outline-none focus-visible:bg-primary/5 sm:w-11 sm:text-sm"
      />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-10 rounded-l-none sm:size-7"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        aria-label={t('delivery.line.oneMore', { label })}
      >
        <Plus aria-hidden />
      </Button>
    </div>
  )
}
