import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import type { ChallanFormValues } from '../schemas/challan-schemas'
import { ChallanTextField } from './entry-field'

/**
 * The entry form, in the order the values appear on a Walton challan: who it
 * is going to and where, then how to reach them, then what is in the box.
 * Following the paper is what makes transcription fast and what stops an
 * operator hunting for the next field.
 */

interface SectionProps {
  register: UseFormRegister<ChallanFormValues>
  errors: FieldErrors<ChallanFormValues>
  watch: UseFormWatch<ChallanFormValues>
  setValue: UseFormSetValue<ChallanFormValues>
  disabled?: boolean
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
  children,
}: {
  icon: LucideIcon
  title: string
  description: string
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
      </header>

      {children}
    </section>
  )
}

/** The two-column grid the field groups use. */
function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3.5 sm:grid-cols-2">{children}</div>
}

/**
 * The fields on this form that hold a plain string. `items` is the exception —
 * it is a list with its own component, and naming the string fields here is
 * what stops `setter` being handed it by mistake.
 */
type TextField = Exclude<keyof ChallanFormValues, 'items'>

/** A setter that marks the field dirty and revalidates, for every assisted write. */
function setter(setValue: UseFormSetValue<ChallanFormValues>, field: TextField) {
  return (value: string) => setValue(field, value, { shouldDirty: true, shouldValidate: true })
}

/**
 * Who the goods are going to.
 *
 * Every text field here can carry Bangla, so every one of them offers the
 * legacy conversion. The customer, thana and district also offer type-ahead
 * from what has been filed before — those three repeat constantly, and a
 * suggestion is what stops one district being recorded three different ways
 * across three challans.
 */
export function CustomerFields({ register, errors, watch, setValue, disabled }: SectionProps) {
  return (
    <FieldGrid>
      <ChallanTextField
        id="customerName"
        label="Customer name"
        required
        wide
        bangla
        suggest="customerName"
        registration={register('customerName')}
        value={watch('customerName')}
        onSetValue={setter(setValue, 'customerName')}
        error={errors.customerName?.message}
        disabled={disabled}
      />

      <ChallanTextField
        id="deliveryAddress"
        label="Delivery address"
        required
        wide
        bangla
        multiline
        registration={register('deliveryAddress')}
        value={watch('deliveryAddress')}
        onSetValue={setter(setValue, 'deliveryAddress')}
        error={errors.deliveryAddress?.message}
        hint="House, road and area exactly as printed. Thana and district go below."
        disabled={disabled}
      />

      <ChallanTextField
        id="thana"
        label="Thana"
        required
        bangla
        suggest="thana"
        registration={register('thana')}
        value={watch('thana')}
        onSetValue={setter(setValue, 'thana')}
        error={errors.thana?.message}
        disabled={disabled}
      />

      <ChallanTextField
        id="district"
        label="District"
        required
        bangla
        suggest="district"
        registration={register('district')}
        value={watch('district')}
        onSetValue={setter(setValue, 'district')}
        error={errors.district?.message}
        disabled={disabled}
      />
    </FieldGrid>
  )
}

/**
 * How to reach them, and what the challan is filed against.
 *
 * `inputMode="tel"` puts a phone keypad under the field on a tablet, which is
 * the difference between two taps and eight. No Bangla conversion here — a
 * phone number is digits, and offering to convert them could only do harm.
 */
export function ContactFields({ register, errors, watch, setValue, disabled }: SectionProps) {
  return (
    <FieldGrid>
      <ChallanTextField
        id="receiverMobile"
        label="Receiver mobile"
        required
        inputMode="tel"
        registration={register('receiverMobile')}
        value={watch('receiverMobile')}
        onSetValue={setter(setValue, 'receiverMobile')}
        error={errors.receiverMobile?.message}
        hint="01712345678, or with +880. Stored in the local eleven-digit form."
        disabled={disabled}
      />

      <ChallanTextField
        id="senderMobile"
        label="Sender mobile"
        inputMode="tel"
        registration={register('senderMobile')}
        value={watch('senderMobile')}
        onSetValue={setter(setValue, 'senderMobile')}
        error={errors.senderMobile?.message}
        disabled={disabled}
      />

      <ChallanTextField
        id="zonePo"
        label="Zone / PO"
        wide
        suggest="zonePo"
        registration={register('zonePo')}
        value={watch('zonePo')}
        onSetValue={setter(setValue, 'zonePo')}
        error={errors.zonePo?.message}
        hint="Copied as one value, exactly as the challan prints it."
        disabled={disabled}
      />
    </FieldGrid>
  )
}

/**
 * What is in the box — a repeatable row, because a challan routinely lists
 * several products. See `ChallanItemRows`, which the entry form renders
 * directly with its field array.
 *
 * The model gets no Bangla conversion for the same reason a phone number does
 * not: it is a code, and a converter pointed at it could only damage it.
 */
