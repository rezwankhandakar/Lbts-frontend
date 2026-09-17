import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { formatTakaBangla, parseAmountInput, takaInBanglaWords } from '@/lib/taka-words'

interface AmountWordsInputProps {
  id: string
  label: string
  value: number | null
  max: number
  disabled?: boolean
  /** Shown under the words when the value cannot be saved as it is. */
  error?: string | null
  onChange: (value: number | null) => void
}

/**
 * A taka amount that reads itself back in Bangla as it is typed.
 *
 * The digits box alone lets `15000` become `150000` with one extra key and
 * nothing looks wrong. The line underneath says "পনেরো হাজার টাকা মাত্র" or
 * "এক লক্ষ পঞ্চাশ হাজার টাকা মাত্র", which nobody confuses. Bangla digits can be
 * typed or pasted too; anything past the ceiling is refused rather than cut.
 *
 * It lived in Delivery for the trip bill until Accounts needed the same box for
 * every amount it records — moved rather than copied, as CLAUDE.md asks.
 */
export function AmountWordsInput({
  id,
  label,
  value,
  max,
  disabled = false,
  error = null,
  onChange,
}: AmountWordsInputProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
          ৳
        </span>
        <Input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          className="pl-7 text-base font-semibold tabular-nums"
          value={value === null ? '' : String(value)}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            const next = parseAmountInput(event.target.value)
            if (next === null || next <= max) {
              onChange(next)
            }
          }}
        />
      </div>
      <p
        aria-live="polite"
        className={cn(
          'min-h-9 rounded-md px-2.5 py-1.5 text-sm leading-snug',
          value === null ? 'bg-muted/40 text-muted-foreground' : 'bg-tone-emerald/10 text-tone-emerald',
        )}
      >
        {value === null ? (
          'এখনো দেওয়া হয়নি'
        ) : (
          <>
            <span className="font-semibold tabular-nums">{formatTakaBangla(value)}</span> —{' '}
            {takaInBanglaWords(value)}
          </>
        )}
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
