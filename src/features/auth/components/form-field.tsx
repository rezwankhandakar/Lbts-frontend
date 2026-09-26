import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  children: ReactNode
  /** Trailing control on the label row, e.g. a "Forgot password?" link. */
  action?: ReactNode
  hint?: string
}

/**
 * The one place a validation message becomes words.
 *
 * `error` arrives as a **translation key** from the Zod schema, or as a
 * sentence the API already wrote — and this translates either without having
 * to know which. An unknown key resolves to itself, so a server message is
 * passed through untouched while a schema key becomes the reader's language.
 * Doing it here rather than at each form is what makes that true of every
 * field at once.
 */
export function FormField({ id, label, error, children, action, hint }: FormFieldProps) {
  const t = useT()

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-[13px] font-medium">
          {label}
        </Label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs leading-snug text-destructive">
          {t(error as TranslationKey)}
        </p>
      ) : hint ? (
        <p className="text-xs leading-snug text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
