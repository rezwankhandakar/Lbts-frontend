import { Plus, Trash2 } from 'lucide-react'
import type {
  FieldArrayWithId,
  FieldErrors,
  UseFormRegister,
  UseFormRegisterReturn,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { MAX_GATE_PASS_ITEMS } from '../schemas/gate-pass-schemas'
import type { GatePassFormValues } from '../schemas/gate-pass-schemas'
import { uppercaseInPlace } from '../lib/uppercase-field'
import { ProductSuggestInput } from './product-suggest-input'

interface GatePassItemRowsProps {
  fields: FieldArrayWithId<GatePassFormValues, 'items', 'id'>[]
  register: UseFormRegister<GatePassFormValues>
  errors: FieldErrors<GatePassFormValues>
  watch: UseFormWatch<GatePassFormValues>
  setValue: UseFormSetValue<GatePassFormValues>
  onAdd: () => void
  onRemove: (index: number) => void
}

const LABEL = 'text-[11px] font-medium text-muted-foreground'

/**
 * The products on the vehicle, one row each.
 *
 * A challan routinely lists several — the indoor and outdoor halves of an air
 * conditioner come as two lines with their own barcodes and quantities — so
 * this is a repeatable row rather than three fixed fields. One row is the
 * minimum: a gate pass carrying nothing is not a gate pass, and the last
 * remaining row cannot be removed.
 *
 * The product box offers what has been filed before and, above that, what the
 * rate card calls the model on this row — so a model copied off the challan
 * names its own product without anybody typing it.
 *
 * **The model box offers nothing.** It is the one field on this form that is
 * read straight off the paper character for character, and a list of models
 * already filed is a list of near-misses over it: `WCF-1D5-GDEL-LX` beside
 * `WCF-1D5-GDEL-SC` is one keystroke apart and a quarter of an inch apart on
 * screen, and picking the wrong one is silent — the gate pass reads as a
 * perfectly ordinary record of a different machine. The suggestion this field
 * used to make was also the one with least to offer: the product name it would
 * have helped fill is already answered by the rate card, from whatever the
 * model actually says.
 */
export function GatePassItemRows({
  fields,
  register,
  errors,
  watch,
  setValue,
  onAdd,
  onRemove,
}: GatePassItemRowsProps) {
  const items = watch('items')
  const isFull = fields.length >= MAX_GATE_PASS_ITEMS

  /** The message for the list itself — "add at least one", or too many. */
  const listError = typeof errors.items?.message === 'string' ? errors.items.message : undefined

  const total = (items ?? []).reduce((sum, item) => {
    const qty = Number.parseInt(item?.qty ?? '', 10)
    return sum + (Number.isFinite(qty) ? qty : 0)
  }, 0)

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {fields.map((field, index) => {
          const rowErrors = errors.items?.[index]
          const productId = `items.${index}.productName`
          const modelId = `items.${index}.model`
          const qtyId = `items.${index}.qty`

          return (
            <li
              key={field.id}
              className="rounded-lg border bg-muted/20 p-3"
              aria-label={`Product ${index + 1}`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Product {index + 1}
                </span>

                {/* Hidden rather than disabled on the last row: there is no
                    state in which removing it is right, and a greyed-out bin
                    only invites the question of how to enable it. */}
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onRemove(index)}
                    aria-label={`Remove product ${index + 1}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 aria-hidden />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_5.5rem]">
                <div className="space-y-1">
                  <Label htmlFor={productId} className={LABEL}>
                    Product name<span className="text-destructive"> *</span>
                  </Label>
                  <ProductSuggestInput
                    id={productId}
                    registration={register(`items.${index}.productName`)}
                    value={items?.[index]?.productName ?? ''}
                    model={items?.[index]?.model ?? ''}
                    invalid={Boolean(rowErrors?.productName)}
                    onPick={(value) =>
                      setValue(`items.${index}.productName`, value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                  <RowError message={rowErrors?.productName?.message} />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={modelId} className={LABEL}>
                    Model<span className="text-destructive"> *</span>
                  </Label>
                  <ModelInput
                    id={modelId}
                    registration={register(`items.${index}.model`)}
                    invalid={Boolean(rowErrors?.model)}
                  />
                  <RowError message={rowErrors?.model?.message} />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={qtyId} className={LABEL}>
                    Qty<span className="text-destructive"> *</span>
                  </Label>
                  <Input
                    id={qtyId}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    autoComplete="off"
                    aria-invalid={rowErrors?.qty ? true : undefined}
                    {...register(`items.${index}.qty`)}
                  />
                  <RowError message={rowErrors?.qty?.message} />
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {listError && (
        <p role="alert" className="text-xs leading-snug text-destructive">
          {listError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onAdd} disabled={isFull}>
          <Plus data-icon="inline-start" aria-hidden />
          Add another product
        </Button>

        <p className={cn('text-xs text-muted-foreground', total === 0 && 'invisible')}>
          {fields.length} {fields.length === 1 ? 'row' : 'rows'} ·{' '}
          <span className="font-medium text-foreground tabular-nums">{total}</span> total
        </p>
      </div>

      {isFull && (
        <p className="text-xs text-muted-foreground">
          That is as many products as one gate pass can carry.
        </p>
      )}
    </div>
  )
}

/**
 * The model, typed and nothing else — no list, no type-ahead, no offer.
 *
 * Capitals are applied as the keys land, the way the other three code fields
 * on this form are: see `lib/uppercase-field.ts`.
 */
function ModelInput({
  id,
  registration,
  invalid,
}: {
  id: string
  registration: UseFormRegisterReturn
  invalid: boolean
}) {
  return (
    <Input
      id={id}
      type="text"
      autoComplete="off"
      spellCheck={false}
      aria-invalid={invalid ? true : undefined}
      {...registration}
      onChange={(event) => {
        uppercaseInPlace(event)
        void registration.onChange(event)
      }}
    />
  )
}

function RowError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return (
    <p role="alert" className="text-xs leading-snug text-destructive">
      {message}
    </p>
  )
}
