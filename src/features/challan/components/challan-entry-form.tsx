import { useEffect } from 'react'
import { Boxes, Loader2, Phone, Save, Send, User } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import type { ParsedChallanFields } from '../lib/paste-parse'
import {
  EMPTY_CHALLAN_FORM,
  EMPTY_ITEM,
  challanFormSchema,
  toChallanValues,
} from '../schemas/challan-schemas'
import type { ChallanFormValues } from '../schemas/challan-schemas'
import type { ChallanValues } from '../types'
import { ChallanItemRows } from './challan-item-rows'
import { ContactFields, CustomerFields, FieldGroup } from './entry-form-sections'
import { PasteParsePanel } from './paste-parse-panel'

interface ChallanEntryFormProps {
  defaultValues?: ChallanFormValues
  isBusy: boolean
  /** Blocks the primary action while something else is wrong — a bad page range. */
  blockedReason?: string | null
  submitLabel: string
  /** Shown on the correction form, where there is a second way out. */
  secondaryAction?: { label: string; onClick: () => void }
  onSubmit: (values: ChallanValues) => void
  /** Lets the workspace keep what has been typed against the queued challan. */
  onValuesChange?: (values: ChallanValues | null) => void
}

/**
 * The ten values that make up a challan.
 *
 * The whole form is built for one motion: read a value off the PDF on the
 * left, paste it into the box on the right, tab, repeat. So the first field
 * takes focus on mount, the tab order follows the challan, Ctrl+Enter files
 * the record without reaching for the mouse, and nothing steals focus while
 * somebody is typing.
 *
 * Validation is inline and on blur. An operator transcribing from a document
 * should find out about a bad mobile number while they are still looking at
 * the mobile number, not in a toast three fields later — `mode: onTouched` is
 * what gives that without shouting at an empty form.
 */
export function ChallanEntryForm({
  defaultValues,
  isBusy,
  blockedReason,
  submitLabel,
  secondaryAction,
  onSubmit,
  onValuesChange,
}: ChallanEntryFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    subscribe,
    formState: { errors },
  } = useForm<ChallanFormValues>({
    resolver: zodResolver(challanFormSchema),
    defaultValues: defaultValues ?? EMPTY_CHALLAN_FORM,
    mode: 'onTouched',
  })

  /**
   * Hands what has been typed back to the workspace, so switching to another
   * challan in the queue and back does not lose it.
   *
   * `subscribe` rather than `watch(callback)`: watch's identity is not stable
   * across renders, so a subscription keyed on it re-registers constantly.
   * This one is registered once and does not re-render the form on every
   * keystroke, which matters on a ten-field form somebody is typing into all
   * day.
   *
   * Only reported once something has actually been touched — an untouched form
   * is not work worth remembering, and reporting it would make the
   * unsaved-changes warning fire on an empty page.
   */
  useEffect(() => {
    if (!onValuesChange) {
      return
    }

    return subscribe({
      formState: { values: true, isDirty: true },
      callback: ({ values, isDirty }) => {
        onValuesChange(isDirty ? (values as unknown as ChallanValues) : null)
      },
    })
  }, [subscribe, onValuesChange])

  const items = useFieldArray({ control, name: 'items' })

  /**
   * What the paste parser is allowed to see, flattened.
   *
   * The parser knows about one product, because a labelled block of text
   * describes one — so its `product`, `model` and `qty` are matched against
   * the *first* row. Anything it fills is still only filled where the field is
   * empty; a second row an operator has already typed is never touched.
   */
  const parseTarget = (): Record<string, string> => {
    const values = getValues()
    const first = values.items[0]

    return {
      customerName: values.customerName,
      deliveryAddress: values.deliveryAddress,
      thana: values.thana,
      district: values.district,
      receiverMobile: values.receiverMobile,
      senderMobile: values.senderMobile,
      zonePo: values.zonePo,
      product: first?.productName ?? '',
      model: first?.model ?? '',
      qty: first?.qty ?? '',
    }
  }

  const fill = (fields: ParsedChallanFields) => {
    const write = (field: 'items.0.productName' | 'items.0.model' | 'items.0.qty', value: string) =>
      setValue(field, value, { shouldDirty: true, shouldValidate: true })

    for (const [field, value] of Object.entries(fields) as [
      keyof ParsedChallanFields,
      string,
    ][]) {
      if (field === 'product') {
        write('items.0.productName', value)
      } else if (field === 'model') {
        write('items.0.model', value)
      } else if (field === 'qty') {
        write('items.0.qty', value)
      } else {
        setValue(field, value, { shouldDirty: true, shouldValidate: true })
      }
    }
  }

  const submit = handleSubmit((values) => onSubmit(toChallanValues(values)))

  return (
    <form
      noValidate
      onSubmit={submit}
      onKeyDown={(event) => {
        // Anyone filing a stack of these works from the keyboard, and reaching
        // for the mouse once per challan is the slowest part of the job.
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !isBusy) {
          event.preventDefault()
          void submit()
        }
      }}
      className="flex min-h-0 flex-col"
      aria-busy={isBusy}
    >
      <div className="min-h-0 flex-1">
        <PasteParsePanel current={parseTarget()} onFill={fill} disabled={isBusy} />

        <FieldGroup
          icon={User}
          title="Customer and delivery"
          description="Who the goods are going to, and where."
        >
          <CustomerFields
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            disabled={isBusy}
          />
        </FieldGroup>

        <FieldGroup
          icon={Phone}
          title="Contact and reference"
          description="How to reach them, and what this challan is filed against."
        >
          <ContactFields
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            disabled={isBusy}
          />
        </FieldGroup>

        <FieldGroup
          icon={Boxes}
          title="Goods"
          description="What is on this challan. Add a row for each product it lists."
        >
          <ChallanItemRows
            fields={items.fields}
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            onAdd={() => items.append({ ...EMPTY_ITEM })}
            onRemove={(index) => items.remove(index)}
            disabled={isBusy}
          />
        </FieldGroup>
      </div>

      {/* Sticky, so the actions stay reachable on a laptop screen without
          scrolling back down past three field groups. */}
      <footer className="sticky bottom-0 z-10 flex flex-col gap-2 border-t bg-card/95 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-muted-foreground">
          {blockedReason ?? (
            <>
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
                Ctrl
              </kbd>
              {' + '}
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
                Enter
              </kbd>{' '}
              files this challan
            </>
          )}
        </p>

        <div className="flex items-center gap-2">
          {secondaryAction && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isBusy}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}

          <Button type="submit" size="lg" disabled={isBusy || Boolean(blockedReason)}>
            {isBusy ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
            ) : secondaryAction ? (
              <Save data-icon="inline-start" aria-hidden />
            ) : (
              <Send data-icon="inline-start" aria-hidden />
            )}
            {submitLabel}
          </Button>
        </div>
      </footer>
    </form>
  )
}
