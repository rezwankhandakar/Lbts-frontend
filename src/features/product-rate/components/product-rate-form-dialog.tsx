import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { ProductRateFormArgs } from '../api/product-rate-api'
import {
  EMPTY_FORM,
  RATE_COLUMNS,
  formStateFrom,
  productRateFormSchema,
  toRates,
} from '../lib/product-rate-form'
import type { ProductRateFormState } from '../lib/product-rate-form'
import type { ProductRateRecord } from '../types'
import { RateFieldGroup } from './rate-field-group'

export type ProductRateFormValues = ProductRateFormArgs

interface ProductRateFormDialogProps {
  /** The row being corrected, or null when adding one. */
  record: ProductRateRecord | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ProductRateFormValues) => void
}

const COLUMN_HINTS: Record<string, string> = {
  isd: 'Inside the metropolitan delivery area.',
  osdMetro: 'Outside it, in a metropolitan or sadar thana.',
  osdThana: 'Outside it, in an upazila thana.',
}

/**
 * Adding or correcting one row of the rate card.
 *
 * The same form for both, because they take the same values — and because the
 * one thing worth saying differently is said in the description. Editing a row
 * changes what challans filed *from now on* are charged; the ones already
 * charged from it keep their figures, which is the opposite of what editing a
 * location row does and therefore the thing an Admin is most likely to assume
 * wrongly.
 */
export function ProductRateFormDialog({
  record,
  open,
  isPending,
  onOpenChange,
  onSubmit,
}: ProductRateFormDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductRateFormState>({
    resolver: zodResolver(productRateFormSchema),
    defaultValues: EMPTY_FORM,
    mode: 'onTouched',
  })

  /**
   * Reloads whenever the dialog opens on a different row. Without it the form
   * would keep the previous product's figures, which on a list of a hundred
   * near-identical refrigerator rows is how the wrong rate gets saved.
   */
  useEffect(() => {
    if (!open) {
      return
    }
    reset(record ? formStateFrom(record) : EMPTY_FORM)
  }, [open, record, reset])

  /**
   * `useWatch` rather than the form's own `watch()`: it subscribes to named
   * fields, so typing in the product box does not re-render every rate group —
   * and it is the API the React Compiler can reason about, which `watch()` is
   * not.
   */
  const isActive = useWatch({ control, name: 'isActive' })
  const rates = {
    isd: useWatch({ control, name: 'isd' }),
    osdMetro: useWatch({ control, name: 'osdMetro' }),
    osdThana: useWatch({ control, name: 'osdThana' }),
  }

  const submit = handleSubmit((state) => {
    onSubmit({
      productName: state.productName,
      productModel: state.productModel,
      capacity: state.capacity,
      rates: toRates(state),
      isActive: state.isActive,
    })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit rate' : 'Add product rate'}</DialogTitle>
          <DialogDescription>
            {record
              ? 'Challans filed from now on are charged at these figures. Ones already charged from this row keep the figures they were charged at.'
              : 'A product, optionally a model, and what it is charged at in each of the three delivery areas.'}
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={submit} className="space-y-4" aria-busy={isPending}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rate-product">Product</Label>
              <Input
                id="rate-product"
                autoComplete="off"
                spellCheck={false}
                disabled={isPending}
                aria-invalid={errors.productName ? true : undefined}
                {...register('productName')}
              />
              {errors.productName && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.productName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rate-model">Model</Label>
              <Input
                id="rate-model"
                autoComplete="off"
                spellCheck={false}
                disabled={isPending}
                aria-invalid={errors.productModel ? true : undefined}
                {...register('productModel')}
              />
              <p className="text-xs leading-snug text-muted-foreground">
                Leave blank if the product has no model. A blank row prices every challan line
                naming this product, whatever model it carries.
              </p>
              {errors.productModel && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.productModel.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rate-capacity">Capacity</Label>
            <Input
              id="rate-capacity"
              autoComplete="off"
              spellCheck={false}
              disabled={isPending}
              aria-invalid={errors.capacity ? true : undefined}
              {...register('capacity')}
            />
            <p className="text-xs leading-snug text-muted-foreground">
              What the card says beside the rate — &ldquo;21 to 40 kg&rdquo;, &ldquo;Gross 151-285
              Litre&rdquo;. Copied onto every challan line this row prices, so somebody reading the
              record can see which rate was applied.
            </p>
          </div>

          <div className="space-y-3">
            {RATE_COLUMNS.map((column) => (
              <RateFieldGroup
                key={column.key}
                column={column.key}
                label={column.label}
                hint={COLUMN_HINTS[column.key]}
                values={rates[column.key]}
                register={register}
                errors={errors}
                setValue={setValue}
                disabled={isPending}
              />
            ))}
          </div>

          <label className="flex items-start gap-2.5 rounded-lg border p-3">
            <Checkbox
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue('isActive', checked === true, { shouldDirty: true })
              }
              disabled={isPending}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium">In use</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                An inactive row prices nothing and is offered nowhere. Challans already charged from
                it keep their figures.
              </span>
            </span>
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
              )}
              {record ? 'Save changes' : 'Add to rate card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
