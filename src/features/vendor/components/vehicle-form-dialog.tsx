import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ownershipMeta } from '../lib/vendor-meta'
import { vehicleFormSchema } from '../schemas/vendor-schemas'
import type { VehicleFormValues } from '../schemas/vendor-schemas'
import { VEHICLE_OWNERSHIP_TYPES } from '../types'
import type { VehicleOwnershipType, VehicleRecord } from '../types'
import { FieldError, FormSection } from './form-parts'
import { useT } from '@/lib/i18n'

const EMPTY: VehicleFormValues = {
  registrationNo: '',
  brand: '',
  model: '',
  ownershipType: 'Vendor Owned',
}

interface VehicleFormDialogProps {
  record: VehicleRecord | null
  /** The vendor this vehicle belongs to, shown rather than chosen. */
  vendorName: string
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: VehicleFormValues) => void
}

/**
 * Adding a vehicle to a fleet, or correcting one.
 *
 * **The vendor is shown and not chosen.** It comes from the page the form was
 * opened on, and it is not editable afterwards: moving a vehicle between vendors
 * would strand its assignment history on the far side of a relationship that no
 * longer exists. A transfer is a controlled business operation — retire the
 * record on one side, create it on the other — rather than a field on an edit
 * form, and the server has no path to change it either.
 *
 * There are no placeholders inside the boxes. A greyed sample value reads as a
 * filled field often enough to matter, and on a form transcribed from a
 * registration document it invites somebody to leave the example in — the rule
 * the Gate Pass entry form already follows. What a field wants is in its label,
 * and anything needing more gets a hint that stays visible.
 */
export function VehicleFormDialog({
  record,
  vendorName,
  open,
  isPending,
  onOpenChange,
  onSubmit,
}: VehicleFormDialogProps) {
  const t = useT()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: EMPTY,
    mode: 'onTouched',
  })

  useEffect(() => {
    if (!open) {
      return
    }
    reset(
      record
        ? {
            registrationNo: record.registrationNo,
            brand: record.brand,
            model: record.model,
            ownershipType: record.ownershipType,
          }
        : EMPTY,
    )
  }, [open, record, reset])

  /**
   * `useWatch` rather than the form's own `watch()`: it subscribes to one field,
   * so typing in the registration box does not re-render the whole dialog — and
   * it is the API the React Compiler can reason about.
   */
  const ownershipType = useWatch({ control, name: 'ownershipType' })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {record ? t('vendor.vehicle.editTitle') : t('vendor.vehicle.addTitle')}
          </DialogTitle>
          <DialogDescription>
            {record
              ? t('vendor.vehicle.editDescription')
              : t('vendor.vehicle.addDescription', { vendor: vendorName })}
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          aria-busy={isPending}
        >
          <FormSection title={t('vendor.vehicle.information')}>
            <div className="space-y-1.5">
              <Label htmlFor="vehicle-registration">{t('vendor.vehicle.registrationLabel')}</Label>
              <Input
                id="vehicle-registration"
                autoComplete="off"
                spellCheck={false}
                disabled={isPending}
                aria-invalid={errors.registrationNo ? true : undefined}
                {...register('registrationNo')}
              />
              <FieldError error={errors.registrationNo?.message} />
              <p className="text-xs leading-snug text-muted-foreground">
                {t('vendor.vehicle.registrationHint')}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="vehicle-brand">
                  Brand <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="vehicle-brand"
                  autoComplete="off"
                  disabled={isPending}
                  {...register('brand')}
                />
                <FieldError error={errors.brand?.message} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vehicle-model">
                  Model <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="vehicle-model"
                  autoComplete="off"
                  disabled={isPending}
                  {...register('model')}
                />
                <FieldError error={errors.model?.message} />
              </div>
            </div>
          </FormSection>

          <FormSection title={t('vendor.vehicle.ownershipSection')}>
            <div className="space-y-1.5">
              <Label htmlFor="vehicle-ownership">{t('vendor.vehicle.ownedOrRented')}</Label>
              <Select
                value={ownershipType}
                onValueChange={(value) =>
                  setValue('ownershipType', value as VehicleOwnershipType, { shouldDirty: true })
                }
                disabled={isPending}
              >
                <SelectTrigger id="vehicle-ownership" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {VEHICLE_OWNERSHIP_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {ownershipMeta(type, t).label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-xs leading-snug text-muted-foreground">
                {ownershipMeta(ownershipType, t).description}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/40 px-3 py-2.5">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {t('common.labels.vendor')}
              </p>
              <p className="mt-0.5 text-[13px] font-medium">{vendorName}</p>
            </div>
          </FormSection>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t('common.actions.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
              )}
              {record ? t('common.actions.saveChanges') : t('vendor.vehicle.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
