import type { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { describedBy } from '../lib/field-messages'

interface EntryFieldProps {
  id: string
  label: string
  error?: string
  /** Shown under the field when there is no error. Keep it short. */
  hint?: string
  required?: boolean
  /** Spans both columns on the two-column grid. */
  wide?: boolean
  children?: ReactNode
}

/**
 * One labelled field on the entry form.
 *
 * The error sits under the control rather than in a toast, because an operator
 * copying values off a printed challan needs to know *which* one the server
 * disliked. `aria-invalid` and `aria-describedby` are wired here so every
 * field gets them without each caller remembering.
 */
export function EntryField({
  id,
  label,
  error,
  hint,
  required,
  wide,
  children,
}: EntryFieldProps) {
  return (
    <div className={cn('space-y-1.5', wide && 'sm:col-span-2')}>
      <Label htmlFor={id} className="text-[13px] font-medium">
        {label}
        {required && (
          <span className="text-destructive" aria-hidden>
            *
          </span>
        )}
        {required && <span className="sr-only">(required)</span>}
      </Label>

      {children}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs leading-snug text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs leading-snug text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

interface EntryInputProps extends EntryFieldProps {
  registration: UseFormRegisterReturn
  type?: 'text' | 'date' | 'number'
  inputMode?: 'text' | 'numeric'
}

/**
 * The common case: a label, an input and its error.
 *
 * There is deliberately no placeholder. A sample value greyed out inside an
 * empty box is read as a filled field often enough to matter, and on a form
 * transcribed from paper it invites somebody to leave the example in. What a
 * field wants is said in its label, and anything that needs more than a label
 * gets a hint under it that stays visible.
 *
 * `autoComplete="off"` throughout: these values are copied from the document
 * in front of the operator, and a browser suggesting the previous customer's
 * name under the cursor is how the wrong one gets filed.
 */
export function EntryInput({ registration, type = 'text', inputMode, ...field }: EntryInputProps) {
  return (
    <EntryField {...field}>
      <Input
        id={field.id}
        type={type}
        inputMode={inputMode}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={field.error ? true : undefined}
        aria-describedby={describedBy(field.id, field.error, field.hint)}
        {...registration}
      />
    </EntryField>
  )
}
