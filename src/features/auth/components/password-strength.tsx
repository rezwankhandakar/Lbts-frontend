import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
  value: string
}

/**
 * Mirrors the rules already enforced by `signUpSchema` — it reports on the
 * same four checks rather than inventing a policy of its own, so the meter can
 * never disagree with validation.
 */
const CHECKS = [
  (value: string) => value.length >= 8,
  (value: string) => /[a-z]/.test(value),
  (value: string) => /[A-Z]/.test(value),
  (value: string) => /[0-9]/.test(value),
]

/**
 * Indexed by how many of the four checks passed, so the table stays what it
 * was — a colour per level — with the word moved out to the message tree.
 */
const LEVELS: { labelKey: TranslationKey; bar: string; text: string }[] = [
  { labelKey: 'auth.password.tooShort', bar: 'bg-destructive', text: 'text-destructive' },
  { labelKey: 'auth.password.weak', bar: 'bg-destructive', text: 'text-destructive' },
  { labelKey: 'auth.password.fair', bar: 'bg-warning', text: 'text-warning' },
  { labelKey: 'auth.password.good', bar: 'bg-info', text: 'text-info' },
  { labelKey: 'auth.password.strong', bar: 'bg-success', text: 'text-success' },
]

export function PasswordStrength({ value }: PasswordStrengthProps) {
  const t = useT()

  if (!value) {
    return null
  }

  const passed = CHECKS.filter((check) => check(value)).length
  const level = LEVELS[passed] ?? LEVELS[0]

  return (
    <div className="space-y-1.5 pt-0.5">
      <div className="flex gap-1" aria-hidden>
        {CHECKS.map((_, index) => (
          <span
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-200',
              index < passed ? level.bar : 'bg-border',
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs', level.text)} aria-live="polite">
        {t('auth.password.strength', { level: t(level.labelKey) })}
      </p>
    </div>
  )
}
