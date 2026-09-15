import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProductSuggestInput } from '@/features/challan/components/product-suggest-input'
import { SuggestInput } from '@/features/challan/components/suggest-input'
import { FieldError } from '@/features/vendor/components/form-parts'

/** Mirrors the trip line in `delivery.validation.ts`. */
const lineSchema = z.object({
  productName: z.string().trim().min(1, 'Product name is required').max(200),
  model: z.string().trim().min(1, 'Model is required').max(120),
  qty: z.coerce
    .number({ error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(100000, 'Quantity is too large'),
})
type LineInput = z.input<typeof lineSchema>
export type LineValues = z.output<typeof lineSchema>

export type LineEditorMode =
  | { kind: 'add' }
  | {
      kind: 'edit'
      initial: LineValues
      /** What the challan line says, when this line stands in for one. */
      source: { productName: string; model: string; ordered: number } | null
    }

interface LineEditorDialogProps {
  mode: LineEditorMode
  challanNumber: string
  onOpenChange: (open: boolean) => void
  onSave: (values: LineValues) => void
}

const EMPTY: LineInput = { productName: '', model: '', qty: 1 }

/**
 * Changing what one line is, or adding one the paper never listed.
 *
 * Changing the model on a line that came from the challan is a
 * **substitution** — the named model was not in the warehouse and another went
 * instead — and it still uses up that challan line. Adding a line is a product
 * the physical load carries that the paper does not. The dialog says which,
 * because the two are recorded differently and read differently on the
 * manifest afterwards.
 *
 * Product and model offer the same type-ahead the challan entry form does,
 * rate card first, so a substitution is spelt the way the business spells it.
 *
 * Mounted only while open, so the form is seeded once from `mode`.
 */
export function LineEditorDialog({
  mode,
  challanNumber,
  onOpenChange,
  onSave,
}: LineEditorDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LineInput, unknown, LineValues>({
    resolver: zodResolver(lineSchema),
    defaultValues: mode.kind === 'edit' ? mode.initial : EMPTY,
  })

  const productName = useWatch({ control, name: 'productName' })
  const model = useWatch({ control, name: 'model' })
  const source = mode.kind === 'edit' ? mode.source : null

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode.kind === 'add' ? 'Add a product' : 'Change this line'}</DialogTitle>
          <DialogDescription>
            {mode.kind === 'add'
              ? `A product on the lorry that ${challanNumber} does not list. It is recorded as added.`
              : source
                ? `The challan orders ${source.productName} ${source.model} × ${source.ordered}. A different product or model here is recorded as a replacement for it.`
                : 'A line added to this trip.'}
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="line-model">Model</Label>
            <SuggestInput
              id="line-model"
              field="model"
              registration={register('model')}
              value={model ?? ''}
              onPick={(value) => setValue('model', value, { shouldValidate: true })}
              invalid={Boolean(errors.model)}
            />
            <FieldError error={errors.model?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="line-product">Product name</Label>
            <ProductSuggestInput
              id="line-product"
              registration={register('productName')}
              value={productName ?? ''}
              model={model ?? ''}
              onPick={(value) => setValue('productName', value, { shouldValidate: true })}
              invalid={Boolean(errors.productName)}
            />
            <FieldError error={errors.productName?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="line-qty">Quantity on this trip</Label>
            <Input
              id="line-qty"
              type="number"
              inputMode="numeric"
              min={1}
              className="w-32"
              aria-invalid={errors.qty ? true : undefined}
              {...register('qty')}
            />
            <FieldError error={errors.qty?.message} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{mode.kind === 'add' ? 'Add product' : 'Save line'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
