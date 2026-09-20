import { useCallback, useEffect, useState } from 'react'
import { Boxes, Building2, Info, Loader2, Route, Save, Send, Tag } from 'lucide-react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { LastGatePassEntry } from '../hooks/use-last-entry'
import { CARRIED_FIELDS, CARRIED_LABELS } from '../lib/carried-fields'
import type { CarriedField, CarriedValues, CarryControls } from '../lib/carried-fields'
import { EMPTY_GATE_PASS_FORM, EMPTY_ITEM, gatePassFormSchema } from '../schemas/gate-pass-schemas'
import type { GatePassFormValues } from '../schemas/gate-pass-schemas'
import { DeliveryFields, FieldGroup, ReferenceFields, TripFields } from './entry-form-sections'
import { GatePassItemRows } from './gate-pass-item-rows'

interface GatePassEntryFormProps {
  defaultValues?: GatePassFormValues
  /** True once a scanned document is attached or staged. */
  hasDocument: boolean
  isBusy: boolean
  /**
   * Why this record cannot be written yet, when something about the staged
   * scan is unresolved — several sheets against a record that takes one
   * document, say.
   *
   * A reason rather than a boolean, because a disabled button that does not
   * say what would enable it is a dead end, and the thing to fix is in the
   * other half of the workspace.
   */
  blockedReason?: string | null
  /** Hidden when the record can no longer be a draft. */
  canSaveDraft: boolean
  /**
   * Whether the primary button files the record or saves a correction to one
   * already filed. It changes the icon and what the footer says a scan is for
   * — a form that shows Send on an action that submits nothing is a small lie.
   */
  primaryAction: 'submit' | 'save'
  submitLabel: string
  /**
   * The last gate pass this session filed, whose repeated values this entry
   * opens with. Named out loud rather than left for the operator to notice —
   * five fields arriving pre-filled is exactly the kind of help that becomes a
   * wrong record if nobody says it happened.
   */
  carried?: LastGatePassEntry | null
  onSaveDraft: (values: GatePassFormValues) => void
  onSubmit: (values: GatePassFormValues) => void
  /** Lets the workspace warn before unsaved work is discarded. */
  onDirtyChange?: (isDirty: boolean) => void
}

/** "Trip date, CSD, Unit, Customer name and Vehicle number" — a sentence. */
function carriedFieldSentence(): string {
  const labels = CARRIED_FIELDS.map((field) => CARRIED_LABELS[field])
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}

/**
 * The nine values that make up a gate pass, in challan order.
 *
 * Validation is inline and on blur: an operator transcribing from paper should
 * find out about a bad quantity while they are still looking at the quantity,
 * not in a toast three fields later. `mode: onTouched` is what gives that
 * without shouting at an empty form.
 *
 * Ctrl+Enter submits. Anyone entering a stack of these works from the keyboard,
 * and reaching for the mouse once per gate pass is the slowest part of the job.
 */
export function GatePassEntryForm({
  defaultValues,
  hasDocument,
  isBusy,
  blockedReason,
  canSaveDraft,
  primaryAction,
  submitLabel,
  carried,
  onSaveDraft,
  onSubmit,
  onDirtyChange,
}: GatePassEntryFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<GatePassFormValues>({
    resolver: zodResolver(gatePassFormSchema),
    defaultValues: defaultValues ?? EMPTY_GATE_PASS_FORM,
    mode: 'onTouched',
  })

  const items = useFieldArray({ control, name: 'items' })

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  /**
   * Which carried fields the operator has pinned to the last gate pass's
   * value.
   *
   * State on the form, so it clears with the form between sheets. A tick that
   * survived into the next entry would be a decision made about the last sheet
   * still holding a value on this one, which is the whole failure the tick box
   * exists to make visible.
   */
  const [pinned, setPinned] = useState<Partial<Record<CarriedField, boolean>>>({})
  const carriedValues = carried?.values ?? null

  const toggleCarry = useCallback(
    (field: CarriedField, next: boolean) => {
      setPinned((marks) => ({ ...marks, [field]: next }))
      if (!carriedValues) {
        return
      }
      // Unticking empties the box rather than leaving the value behind for
      // editing: what was in it was the *last* sheet's value, put there by the
      // tick and by nothing else, so taking the tick off takes it with it.
      // Nothing typed can be lost this way — a ticked field is read-only.
      setValue(field, next ? carriedValues[field] : '', {
        shouldDirty: true,
        shouldValidate: next,
      })
    },
    [carriedValues, setValue],
  )

  const [tripDate, csd, unit, customerName, vehicleNo] = useWatch({
    control,
    name: CARRIED_FIELDS,
  })

  /**
   * A tick is drawn only while its field still holds what was carried —
   * derived from the two values rather than stored beside them, so it cannot
   * come to assert something untrue.
   *
   * Read-only is what normally keeps them equal, but a date input honours that
   * unevenly across browsers, and a value set from anywhere else would leave
   * the box claiming "same as last" over something different. Deriving drops
   * the tick instead: what the operator typed wins, and the box simply stops
   * saying something that is no longer so.
   */
  const now: CarriedValues = { tripDate, csd, unit, customerName, vehicleNo }
  const kept: Partial<Record<CarriedField, boolean>> = {}
  if (carriedValues) {
    for (const field of CARRIED_FIELDS) {
      if (pinned[field] && now[field] === carriedValues[field]) {
        kept[field] = true
      }
    }
  }

  const carry: CarryControls | undefined = carriedValues
    ? {
        values: carriedValues,
        kept,
        toggle: toggleCarry,
        gatePassId: carried?.gatePassId ?? null,
      }
    : undefined

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={(event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !isBusy) {
          event.preventDefault()
          void handleSubmit(onSubmit)()
        }
      }}
      className="flex min-h-0 flex-col"
      aria-busy={isBusy}
    >
      <div className="min-h-0 flex-1">
        {/* Said plainly, because a value from the last sheet is only ever an
            offer here — what fills a field is somebody pressing its tick. */}
        {carried && (
          <p
            className="flex items-start gap-2 border-b bg-tone-amber/5 px-4 py-2.5 text-xs leading-snug text-muted-foreground sm:px-5"
            role="status"
          >
            <Info className="mt-px size-3.5 shrink-0 text-tone-amber" aria-hidden />
            <span>
              {carriedFieldSentence()} from{' '}
              <span className="font-medium text-foreground">{carried.gatePassId}</span> are shown
              above their boxes. Tick <span className="font-medium">Same as last</span> on any that
              match this sheet; the rest stay empty until you type them.
            </span>
          </p>
        )}

        <FieldGroup icon={Route} title="Trip" description="The delivery order and where it left from.">
          <TripFields register={register} errors={errors} carry={carry} />
        </FieldGroup>

        <FieldGroup
          icon={Building2}
          title="Delivery"
          description="Who the goods are going to, and what is carrying them."
        >
          <DeliveryFields
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            carry={carry}
          />
        </FieldGroup>

        <FieldGroup
          icon={Tag}
          title="Reference"
          description="Optional. Filed against a zone or a purchase order."
        >
          <ReferenceFields
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </FieldGroup>

        <FieldGroup
          icon={Boxes}
          title="Goods"
          description="What is on the vehicle. Add a row for each product on the challan."
        >
          <GatePassItemRows
            fields={items.fields}
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            onAdd={() => items.append({ ...EMPTY_ITEM })}
            onRemove={(index) => items.remove(index)}
          />
        </FieldGroup>
      </div>

      {/* Sticky, so the actions stay reachable on a laptop screen without
          scrolling back down past four field groups. */}
      <footer className="sticky bottom-0 z-10 flex flex-col gap-2 border-t bg-card/95 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-muted-foreground">
          {blockedReason ? (
            <span className="text-tone-amber">{blockedReason}</span>
          ) : hasDocument ? (
            <span className="text-tone-emerald">Document attached</span>
          ) : (
            'A scanned document is required to submit.'
          )}
        </p>

        <div className="flex items-center gap-2">
          {canSaveDraft && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isBusy || Boolean(blockedReason)}
              onClick={() => void handleSubmit(onSaveDraft)()}
            >
              <Save data-icon="inline-start" aria-hidden />
              Save draft
            </Button>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isBusy || !hasDocument || Boolean(blockedReason)}
          >
            {isBusy ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
            ) : primaryAction === 'save' ? (
              <Save data-icon="inline-start" aria-hidden />
            ) : (
              <Send data-icon="inline-start" aria-hidden />
            )}
            {submitLabel}
          </Button>
        </div>
      </footer>

      <p className={cn('sr-only')} aria-live="polite">
        {blockedReason ??
          (hasDocument ? 'A scanned document is attached.' : 'No scanned document yet.')}
      </p>
    </form>
  )
}
