import { Plus, Trash2 } from 'lucide-react'
import type {
  FieldArrayWithId,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ChallanFormValues } from '../schemas/challan-schemas'
import { MAX_CHALLAN_ITEMS } from '../types'
import { BanglaConvertControl } from './bangla-convert'
import { SuggestInput } from './suggest-input'

interface ChallanItemRowsProps {
  fields: FieldArrayWithId<ChallanFormValues, 'items', 'id'>[]
  register: UseFormRegister<ChallanFormValues>
  errors: FieldErrors<ChallanFormValues>
  watch: UseFormWatch<ChallanFormValues>
  setValue: UseFormSetValue<ChallanFormValues>
  onAdd: () => void
  onRemove: (index: number) => void
  disabled?: boolean
}

const LABEL = 'text-[11px] font-medium text-muted-foreground'

/**
 * The products on the challan, one row each.
 *
 * A Walton challan routinely lists several — a refrigerator and the stand it
 * ships on, or two models on one delivery — each with its own quantity. So
 * this is a repeatable row rather than three fixed fields. One row is the
 * minimum, because a challan carrying nothing is not a challan, and the last
 * remaining row therefore cannot be removed.
 *
 * Product and model offer what has been filed before, which is what keeps the
 * same model from being recorded three ways across three challans. The product
 * name also offers the Bijoy conversion: a Bangla product description is
 * common on these challans, and the model number never is.
 */
export function ChallanItemRows({
  fields,
  register,
  errors,
  watch,
  setValue,
  onAdd,
  onRemove,
  disabled,
}: ChallanItemRowsProps) {
  const items = watch('items')
  const isFull = fields.length >= MAX_CHALLAN_ITEMS

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
          const productValue = items?.[index]?.productName ?? ''

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
                    disabled={disabled}
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
                    Product<span className="text-destructive"> *</span>
                  </Label>
                  <SuggestInput
                    id={productId}
                    field="product"
                    registration={register(`items.${index}.productName`)}
                    value={productValue}
                    invalid={Boolean(rowErrors?.productName)}
                    onPick={(value) =>
                      setValue(`items.${index}.productName`, value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                  <RowError message={rowErrors?.productName?.message} />
                  <BanglaConvertControl
                    value={productValue}
                    label={`Product ${index + 1}`}
                    disabled={disabled}
                    onApply={(value) =>
                      setValue(`items.${index}.productName`, value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={modelId} className={LABEL}>
                    Model<span className="text-destructive"> *</span>
                  </Label>
                  <SuggestInput
                    id={modelId}
                    field="model"
                    registration={register(`items.${index}.model`)}
                    value={items?.[index]?.model ?? ''}
                    invalid={Boolean(rowErrors?.model)}
                    onPick={(value) =>
                      setValue(`items.${index}.model`, value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
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
                    disabled={disabled}
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={disabled || isFull}
        >
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
          That is as many products as one challan can carry.
        </p>
      )}
    </div>
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
