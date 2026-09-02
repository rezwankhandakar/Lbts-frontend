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

const LEVELS = [
  { label: 'Too short', bar: 'bg-destructive', text: 'text-destructive' },
  { label: 'Weak', bar: 'bg-destructive', text: 'text-destructive' },
  { label: 'Fair', bar: 'bg-warning', text: 'text-warning' },
  { label: 'Good', bar: 'bg-info', text: 'text-info' },
  { label: 'Strong', bar: 'bg-success', text: 'text-success' },
]

export function PasswordStrength({ value }: PasswordStrengthProps) {
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
        Password strength: {level.label}
      </p>
    </div>
  )
}
