import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { GatePassFormValues } from '../schemas/gate-pass-schemas'
import type { GatePassReferenceType } from '../types'
import { describedBy } from '../lib/field-messages'
import { EntryField, EntryInput } from './entry-field'
import { SuggestInput } from './suggest-input'

/**
 * The entry form, in the order the values appear on a Walton challan: the trip
 * first, then who it is going to and on what, then the reference it is filed
 * under, then the goods. Following the paper is what makes transcription fast
 * and what stops an operator hunting for the next box.
 */

interface SectionProps {
  register: UseFormRegister<GatePassFormValues>
  errors: FieldErrors<GatePassFormValues>
}

/**
 * A titled group of fields. Quieter than a card — the whole form is already on
 * one card, and nesting cards inside cards would make a short form look like a
 * settings page.
 */
export function FieldGroup({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon: LucideIcon
  title: string
  description: string
  /** Usually the control that adds a row. */
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="border-b px-4 py-4 last:border-b-0 sm:px-5 sm:py-5">
      <header className="mb-3.5 flex items-start gap-2.5">
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-semibold tracking-tight">{title}</h3>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{description}</p>
        </div>
        {action}
      </header>

      {children}
    </section>
  )
}

/** The two-column grid the plain field groups use. */
export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3.5 sm:grid-cols-2">{children}</div>
}

export function TripFields({ register, errors }: SectionProps) {
  return (
    <FieldGrid>
      <EntryInput
        id="tripDo"
        label="Trip DO"
        required
        registration={register('tripDo')}
        error={errors.tripDo?.message}
        hint="Exactly as printed. Punctuation and spacing are kept."
      />
      <EntryInput
        id="tripDate"
        label="Trip date"
        required
        type="date"
        registration={register('tripDate')}
        error={errors.tripDate?.message}
      />
      <EntryInput
        id="csd"
        label="CSD"
        required
        registration={register('csd')}
        error={errors.csd?.message}
      />
      <EntryInput
        id="unit"
        label="Unit"
        required
        registration={register('unit')}
        error={errors.unit?.message}
      />
    </FieldGrid>
  )
}

interface DeliveryFieldsProps extends SectionProps {
  watch: UseFormWatch<GatePassFormValues>
  setValue: UseFormSetValue<GatePassFormValues>
}

/**
 * Customer and vehicle both offer what has been filed before. These two repeat
 * constantly — the same customers, the same trucks — and a suggestion is what
 * stops one of them being recorded three different ways across three gate
 * passes.
 */
export function DeliveryFields({ register, errors, watch, setValue }: DeliveryFieldsProps) {
  const customerName = watch('customerName')
  const vehicleNo = watch('vehicleNo')

  return (
    <FieldGrid>
      <EntryField
        id="customerName"
        label="Customer name"
        required
        wide
        error={errors.customerName?.message}
      >
        <SuggestInput
          id="customerName"
          field="customerName"
          registration={register('customerName')}
          value={customerName}
          invalid={Boolean(errors.customerName)}
          describedBy={describedBy('customerName', errors.customerName?.message)}
          onPick={(value) =>
            setValue('customerName', value, { shouldDirty: true, shouldValidate: true })
          }
        />
      </EntryField>

      <EntryField
        id="vehicleNo"
        label="Vehicle number"
        required
        wide
        error={errors.vehicleNo?.message}
        hint="Kept exactly as entered, so it matches the plate on the challan."
      >
        <SuggestInput
          id="vehicleNo"
          field="vehicleNo"
          registration={register('vehicleNo')}
          value={vehicleNo}
          invalid={Boolean(errors.vehicleNo)}
          describedBy={describedBy(
            'vehicleNo',
            errors.vehicleNo?.message,
            'Kept exactly as entered, so it matches the plate on the challan.',
          )}
          onPick={(value) =>
            setValue('vehicleNo', value, { shouldDirty: true, shouldValidate: true })
          }
        />
      </EntryField>
    </FieldGrid>
  )
}

interface ReferenceFieldsProps extends SectionProps {
  watch: UseFormWatch<GatePassFormValues>
  setValue: UseFormSetValue<GatePassFormValues>
}

const REFERENCE_OPTIONS: { value: GatePassReferenceType; label: string }[] = [
  { value: 'None', label: 'No reference' },
  { value: 'Zone', label: 'Zone' },
  { value: 'PO', label: 'PO' },
]

/**
 * Zone and PO are two different things, so they are two different fields with
 * a selector deciding which one applies — never one ambiguous "Zone / PO" box.
 * That is what lets a report group by zone later without parsing free text
 * back out of a column.
 */
export function ReferenceFields({ register, errors, watch, setValue }: ReferenceFieldsProps) {
  const referenceType = watch('referenceType')

  return (
    <FieldGrid>
      <EntryField id="referenceType" label="Reference type">
        <Select
          value={referenceType}
          onValueChange={(value) => {
            setValue('referenceType', value as GatePassReferenceType, { shouldDirty: true })
            // The other side is cleared as the type changes, so a value the
            // operator can no longer see cannot be submitted behind their back.
            if (value !== 'Zone') {
              setValue('zone', '', { shouldValidate: false })
            }
            if (value !== 'PO') {
              setValue('po', '', { shouldValidate: false })
            }
          }}
        >
          <SelectTrigger id="referenceType" className="w-full" aria-label="Reference type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {REFERENCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </EntryField>

      {referenceType === 'Zone' && (
        <EntryInput
          id="zone"
          label="Zone"
          required
          registration={register('zone')}
          error={errors.zone?.message}
        />
      )}

      {referenceType === 'PO' && (
        <EntryInput
          id="po"
          label="PO number"
          required
          registration={register('po')}
          error={errors.po?.message}
        />
      )}

      {referenceType === 'None' && (
        <p className="self-end pb-2 text-xs text-muted-foreground">
          This gate pass is not filed against a zone or a PO.
        </p>
      )}
    </FieldGrid>
  )
}
