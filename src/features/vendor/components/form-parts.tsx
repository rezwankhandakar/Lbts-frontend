import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/**
 * The small pieces every form in this module is built from.
 *
 * Shared rather than repeated, because five forms hand-rolling their own error
 * paragraph is five chances to disagree about its size and colour — and because
 * CLAUDE.md asks that related fields be grouped rather than stacked in one flat
 * column, which is easier to do consistently when the grouping is a component.
 */

export function FieldError({ error }: { error?: string }) {
  if (!error) {
    return null
  }

  return (
    <p role="alert" className="text-xs text-destructive">
      {error}
    </p>
  )
}

interface FormSectionProps {
  title: string
  /** A sentence under the heading, where the group needs one. */
  description?: string
  children: ReactNode
  className?: string
}

/**
 * A titled group of fields.
 *
 * A hairline rule and a small uppercase label rather than a card inside a
 * dialog: nesting a raised surface in a raised surface is the "excessive
 * rounded cards" look the brief rules out, and on a phone it wastes the width
 * the fields need.
 */
export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <fieldset className={cn('space-y-3', className)}>
      <legend className="w-full border-b pb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </legend>
      {description && (
        <p className="text-xs leading-snug text-muted-foreground">{description}</p>
      )}
      <div className="space-y-4 pt-1">{children}</div>
    </fieldset>
  )
}

interface DateFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
  hint?: string
}

/**
 * A calendar day.
 *
 * A native date input, deliberately. Every date in this module is a calendar
 * day — a licence expires *on* the 20th — so `YYYY-MM-DD` is exactly what the
 * API wants and exactly what this control produces, with no timezone in the
 * middle of it. A date picker component would be a dependency and a conversion
 * step in exchange for a control the browser already renders correctly on a
 * phone.
 */
export function DateField({
  id,
  label,
  value,
  onChange,
  disabled,
  error,
  hint,
}: DateFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className="w-full"
      />
      <FieldError error={error} />
      {hint && !error && <p className="text-xs leading-snug text-muted-foreground">{hint}</p>}
    </div>
  )
}

/**
 * A label and a value, for the read-only panels.
 *
 * Two columns on a wide screen and stacked on a narrow one, which is the one
 * layout decision that has to be the same everywhere or a details page reads as
 * several pages glued together.
 */
export function InfoRow({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('grid gap-0.5 py-2 sm:grid-cols-[9rem_1fr] sm:gap-4 sm:py-2.5', className)}>
      <dt className="text-xs text-muted-foreground sm:text-[13px]">{label}</dt>
      <dd className="min-w-0 text-[13px] wrap-break-word">{children}</dd>
    </div>
  )
}
