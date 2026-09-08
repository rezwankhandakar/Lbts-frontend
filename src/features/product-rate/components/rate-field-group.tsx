import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { previewAmount, rateDescription } from '../lib/rate-format'
import { toRate } from '../lib/product-rate-form'
import type {
  ProductRateFormState,
  RateColumnKey,
  RateFieldsState,
} from '../lib/product-rate-form'
import { RATE_KINDS } from '../types'

interface RateFieldGroupProps {
  column: RateColumnKey
  label: string
  hint: string
  values: RateFieldsState
  register: UseFormRegister<ProductRateFormState>
  errors: FieldErrors<ProductRateFormState>
  setValue: UseFormSetValue<ProductRateFormState>
  disabled?: boolean
}

const LABEL = 'text-[11px] font-medium text-muted-foreground'

/** How many pieces the worked example prices. Enough to cross a tier. */
const PREVIEW_QTY = 12

/**
 * One column of the rate card.
 *
 * Two kinds behind one control, because that is what the card has: most
 * products are a single figure, and two of them are "ek challan e prothom 5
 * pics 60, porer gulo 24 kore". The tiered form is not an advanced option
 * hidden somewhere — it is on the card, so it is on the form.
 *
 * The worked example underneath is the part that earns its place. A tiered
 * rate is three numbers whose meaning is not visible in the numbers, and
 * "12 pieces would be ৳468" is the only way somebody can tell at a glance that
 * they have entered the rule they meant rather than an arithmetically valid
 * one they did not.
 */
export function RateFieldGroup({
  column,
  label,
  hint,
  values,
  register,
  errors,
  setValue,
  disabled,
}: RateFieldGroupProps) {
  const rowErrors = errors[column]
  const isTiered = values.kind === 'tiered'

  /**
   * The example is only drawn once the fields it reads are actually numbers.
   * A half-typed rate would otherwise flash nonsense figures on every
   * keystroke, which teaches people to stop reading it.
   */
  const isComplete = isTiered
    ? [values.firstQty, values.firstAmount, values.restAmount].every(
        (value) => value.trim() !== '' && Number.isFinite(Number(value)),
      )
    : values.amount.trim() !== '' && Number.isFinite(Number(values.amount))

  return (
    <fieldset className="rounded-lg border bg-muted/20 p-3">
      <legend className="px-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </legend>

      <p className="mb-2.5 text-xs leading-snug text-muted-foreground">{hint}</p>

      <div
        role="radiogroup"
        aria-label={`${label} rate type`}
        className="mb-3 inline-flex rounded-lg border bg-background p-0.5"
      >
        {RATE_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={values.kind === kind}
            disabled={disabled}
            onClick={() => setValue(`${column}.kind`, kind, { shouldDirty: true })}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              values.kind === kind
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {kind === 'flat' ? 'Flat' : 'Tiered'}
          </button>
        ))}
      </div>

      {isTiered ? (
        <div className="grid gap-2.5 sm:grid-cols-3">
          <Field
            id={`${column}-first-qty`}
            label="First pieces"
            error={rowErrors?.firstQty?.message}
            registration={register(`${column}.firstQty`)}
            disabled={disabled}
          />
          <Field
            id={`${column}-first-amount`}
            label="At each"
            error={rowErrors?.firstAmount?.message}
            registration={register(`${column}.firstAmount`)}
            disabled={disabled}
          />
          <Field
            id={`${column}-rest-amount`}
            label="Then each"
            error={rowErrors?.restAmount?.message}
            registration={register(`${column}.restAmount`)}
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="sm:max-w-[12rem]">
          <Field
            id={`${column}-amount`}
            label="Per piece"
            error={rowErrors?.amount?.message}
            registration={register(`${column}.amount`)}
            disabled={disabled}
          />
        </div>
      )}

      {isComplete && (
        <p className="mt-2.5 text-xs leading-snug text-muted-foreground">
          {rateDescription(toRate(values))}
          {isTiered && (
            <>
              {' '}
              <span className="text-foreground">
                {PREVIEW_QTY} pieces would be{' '}
                {new Intl.NumberFormat('en-BD').format(
                  previewAmount(toRate(values), PREVIEW_QTY),
                )}
                .
              </span>
            </>
          )}
        </p>
      )}
    </fieldset>
  )
}

interface FieldProps {
  id: string
  label: string
  error?: string
  registration: ReturnType<UseFormRegister<ProductRateFormState>>
  disabled?: boolean
}

function Field({ id, label, error, registration, disabled }: FieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className={LABEL}>
        {label}
      </Label>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        {...registration}
      />
      {error && (
        <p role="alert" className="text-xs leading-snug text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
