import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { locationTypeMeta } from '../lib/location-meta'
import { LOCATION_TYPES } from '../types'
import type { LocationRecord, LocationType } from '../types'
import { useT } from '@/lib/i18n'

/**
 * Mirrors `location.validation.ts`. The server enforces these; this exists so
 * an Admin sees the problem beside the field rather than in a toast after a
 * round trip. Change one, change both.
 *
 * There is no field for the comparison keys, and there could not be: they are
 * derived from the district and thana by the server, and a client that could
 * set one could make a row match something it does not say.
 */
const locationFormSchema = z.object({
  district: z
    .string()
    .trim()
    .min(2, 'location.validation.districtTooShort')
    .max(120, 'location.validation.districtTooLong'),
  thana: z
    .string()
    .trim()
    .min(2, 'location.validation.thanaTooShort')
    .max(120, 'location.validation.thanaTooLong'),
  locationType: z.enum(LOCATION_TYPES, { error: 'location.validation.typeRequired' }),
  isActive: z.boolean(),
})

export type LocationFormValues = z.infer<typeof locationFormSchema>

const EMPTY: LocationFormValues = {
  district: '',
  thana: '',
  locationType: 'OSD-Thana',
  isActive: true,
}

interface LocationFormDialogProps {
  /** The row being corrected, or null when adding one. */
  record: LocationRecord | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: LocationFormValues) => void
}

/**
 * Adding or correcting one master location.
 *
 * The same form for both, because they take the same four values — and
 * because the one thing worth saying differently is said in the description:
 * editing a row changes what every challan pointing at it reports, which is
 * the whole reason a challan stores a reference rather than a copy.
 */
export function LocationFormDialog({
  record,
  open,
  isPending,
  onOpenChange,
  onSubmit,
}: LocationFormDialogProps) {
  const t = useT()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: EMPTY,
    mode: 'onTouched',
  })

  /**
   * Reloads whenever the dialog opens on a different row. Without it the form
   * would keep the previous location's values, which on a list of six hundred
   * near-identical rows is how the wrong one gets edited.
   */
  useEffect(() => {
    if (!open) {
      return
    }
    reset(
      record
        ? {
            district: record.district,
            thana: record.thana,
            locationType: record.locationType,
            isActive: record.isActive,
          }
        : EMPTY,
    )
  }, [open, record, reset])

  /**
   * `useWatch` rather than the form's own `watch()`: it subscribes to one
   * field, so typing in the district box does not re-render the whole dialog —
   * and it is the API the React Compiler can reason about, which `watch()` is
   * not.
   */
  const locationType = useWatch({ control, name: 'locationType' })
  const isActive = useWatch({ control, name: 'isActive' })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {record ? t('location.form.editTitle') : t('location.form.addTitle')}
          </DialogTitle>
          <DialogDescription>
            {record
              ? t('location.form.editDescription')
              : t('location.form.addDescription')}
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          aria-busy={isPending}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="location-district">{t('location.table.district')}</Label>
              <Input
                id="location-district"
                autoComplete="off"
                spellCheck={false}
                disabled={isPending}
                aria-invalid={errors.district ? true : undefined}
                {...register('district')}
              />
              {errors.district && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.district.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location-thana">{t('location.table.thana')}</Label>
              <Input
                id="location-thana"
                autoComplete="off"
                spellCheck={false}
                disabled={isPending}
                aria-invalid={errors.thana ? true : undefined}
                {...register('thana')}
              />
              {errors.thana && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.thana.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location-type">{t('location.table.location')}</Label>
            <Select
              value={locationType}
              onValueChange={(value) =>
                setValue('locationType', value as LocationType, { shouldDirty: true })
              }
              disabled={isPending}
            >
              <SelectTrigger id="location-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {LOCATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {locationTypeMeta(type, t).label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-xs leading-snug text-muted-foreground">
              {locationTypeMeta(locationType, t).description}
            </p>
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
              <span className="block text-[13px] font-medium">{t('location.form.inUse')}</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                An inactive location is offered nowhere and matched to nothing. Challans that
                already reference it keep the district, thana and type it gives them.
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
              {t('common.actions.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />}
              {record ? t('common.actions.saveChanges') : t('location.addLocation')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
