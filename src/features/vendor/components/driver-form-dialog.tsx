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
import { Textarea } from '@/components/ui/textarea'
import { driverFormSchema } from '../schemas/vendor-schemas'
import type { DriverFormValues } from '../schemas/vendor-schemas'
import type { DriverDetail } from '../types'
import { DateField, FieldError, FormSection } from './form-parts'

const EMPTY: DriverFormValues = {
  name: '',
  mobile: '',
  nidNumber: '',
  address: '',
  licenseNumber: '',
  licenseExpiry: '',
}

interface DriverFormDialogProps {
  /**
   * The **full** record, not a list row.
   *
   * A list row deliberately carries neither the NID nor the address — that is
   * what keeps personal data off a table of eighteen drivers — so editing needs
   * the record fetched on its own, and the panel does not open this until it
   * has. Accepting a list row here would produce a form that silently blanked
   * two fields on save.
   */
  record: DriverDetail | null
  vendorName: string
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: DriverFormValues) => void
}

/**
 * Adding a driver to a vendor, or correcting one.
 *
 * The vendor is shown and not chosen, exactly as on the vehicle form: it comes
 * from the page and the server reads it from the URL, so there is no field here
 * a request could use to file a driver under somebody else.
 *
 * Three groups, because a driver record is three different things: who they are,
 * what identifies them, and what licenses them to drive. The licence pair is
 * last and grouped together because the two fields depend on each other — an
 * expiry with no number behind it is a deadline attached to nothing, and both
 * this form and the API refuse it.
 *
 * **Filing a licence number here files a Driving License document too**, which
 * is what puts its expiry into the vendor's compliance counts. The hint says so,
 * because otherwise somebody would type an expiry, see no alert, and conclude
 * the compliance panel was broken.
 */
export function DriverFormDialog({
  record,
  vendorName,
  open,
  isPending,
  onOpenChange,
  onSubmit,
}: DriverFormDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
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
            name: record.name,
            mobile: record.mobile,
            nidNumber: record.nidNumber,
            address: record.address,
            licenseNumber: record.licenseNumber,
            licenseExpiry: record.licenseExpiry ?? '',
          }
        : EMPTY,
    )
  }, [open, record, reset])

  const licenseExpiry = useWatch({ control, name: 'licenseExpiry' })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit driver' : 'Add driver'}</DialogTitle>
          <DialogDescription>
            {record
              ? 'The driver code and the vendor they work for stay the same.'
              : `This driver will work for ${vendorName}. A driver code is allocated automatically.`}
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          aria-busy={isPending}
        >
          <FormSection title="Driver information">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="driver-name">Full name</Label>
                <Input
                  id="driver-name"
                  autoComplete="name"
                  disabled={isPending}
                  aria-invalid={errors.name ? true : undefined}
                  {...register('name')}
                />
                <FieldError error={errors.name?.message} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="driver-mobile">Mobile number</Label>
                <Input
                  id="driver-mobile"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  disabled={isPending}
                  aria-invalid={errors.mobile ? true : undefined}
                  {...register('mobile')}
                />
                <FieldError error={errors.mobile?.message} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="driver-address">
                Address <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="driver-address"
                rows={2}
                disabled={isPending}
                {...register('address')}
              />
              <FieldError error={errors.address?.message} />
            </div>
          </FormSection>

          <FormSection
            title="Identity"
            description="Kept off every list in the system and shown only on this driver's own record."
          >
            <div className="space-y-1.5">
              <Label htmlFor="driver-nid">
                NID number <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="driver-nid"
                autoComplete="off"
                spellCheck={false}
                inputMode="numeric"
                disabled={isPending}
                aria-invalid={errors.nidNumber ? true : undefined}
                {...register('nidNumber')}
              />
              <FieldError error={errors.nidNumber?.message} />
            </div>
          </FormSection>

          <FormSection title="Licence">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="driver-licence">
                  Licence number <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="driver-licence"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={isPending}
                  aria-invalid={errors.licenseNumber ? true : undefined}
                  {...register('licenseNumber')}
                />
                <FieldError error={errors.licenseNumber?.message} />
              </div>

              <DateField
                id="driver-licence-expiry"
                label="Licence expiry"
                value={licenseExpiry}
                onChange={(value) => setValue('licenseExpiry', value, { shouldDirty: true })}
                disabled={isPending}
                error={errors.licenseExpiry?.message}
              />
            </div>

            <p className="rounded-lg border bg-muted/40 px-3 py-2 text-xs leading-snug text-muted-foreground">
              A licence recorded here is also filed as a <strong>Driving License</strong> document,
              which is what puts its expiry into this vendor&apos;s compliance counts. Attach a scan
              of it from the documents tab.
            </p>
          </FormSection>

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
              {record ? 'Save changes' : 'Add driver'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
