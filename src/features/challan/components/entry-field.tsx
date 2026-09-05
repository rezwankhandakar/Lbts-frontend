import type { ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { describedBy } from '../lib/field-messages'
import type { ChallanSuggestionField } from '../types'
import { BanglaConvertControl } from './bangla-convert'
import { SuggestInput } from './suggest-input'

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
 * copying values out of a PDF needs to know *which* one is wrong. `aria-invalid`
 * and `aria-describedby` are wired here so every field gets them without each
 * caller remembering.
 */
export function EntryField({ id, label, error, hint, required, wide, children }: EntryFieldProps) {
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
        {!required && (
          <span className="ml-1 text-[11px] font-normal text-muted-foreground">Optional</span>
        )}
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

interface TextFieldProps extends EntryFieldProps {
  registration: UseFormRegisterReturn
  /** The live value — needed for type-ahead and for the Bijoy preview. */
  value: string
  onSetValue: (value: string) => void
  /** Offers what has already been filed under this field. */
  suggest?: ChallanSuggestionField
  /** Offers the legacy-Bangla conversion under the field. */
  bangla?: boolean
  multiline?: boolean
  inputMode?: 'text' | 'numeric' | 'tel'
  disabled?: boolean
}

/**
 * The common case: a label, a control, its error, and — where the value could
 * be Bangla — the conversion offer underneath.
 *
 * There is deliberately no placeholder anywhere on this form. A sample value
 * greyed out inside an empty box is read as a filled field often enough to
 * matter, and on a form transcribed from a PDF it invites somebody to leave
 * the example in. What a field wants is said in its label, and anything that
 * needs more gets a hint under it that stays visible.
 *
 * `autoComplete="off"` throughout: these values are copied from the document
 * on screen, and a browser suggesting the previous customer's address under
 * the cursor is how the wrong one gets filed.
 */
export function ChallanTextField({
  registration,
  value,
  onSetValue,
  suggest,
  bangla,
  multiline,
  inputMode,
  disabled,
  ...field
}: TextFieldProps) {
  const described = describedBy(field.id, field.error, field.hint)

  return (
    <EntryField {...field}>
      {suggest ? (
        <SuggestInput
          id={field.id}
          field={suggest}
          registration={registration}
          value={value}
          invalid={Boolean(field.error)}
          describedBy={described}
          onPick={onSetValue}
        />
      ) : multiline ? (
        <Textarea
          id={field.id}
          rows={2}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          aria-invalid={field.error ? true : undefined}
          aria-describedby={described}
          className="min-h-16 resize-y"
          {...registration}
        />
      ) : (
        <Input
          id={field.id}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          aria-invalid={field.error ? true : undefined}
          aria-describedby={described}
          {...registration}
        />
      )}

      {bangla && (
        <BanglaConvertControl
          value={value}
          label={field.label}
          disabled={disabled}
          onApply={onSetValue}
        />
      )}
    </EntryField>
  )
}
