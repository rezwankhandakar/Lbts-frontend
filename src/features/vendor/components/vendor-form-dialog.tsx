import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
import { vendorFormSchema } from '../schemas/vendor-schemas'
import type { VendorFormValues } from '../schemas/vendor-schemas'
import type { VendorRecord } from '../types'
import { FieldError, FormSection } from './form-parts'
import { useT } from '@/lib/i18n'

const EMPTY: VendorFormValues = { name: '', mobile: '', address: '' }

interface VendorFormDialogProps {
  /** The vendor being corrected, or null when adding one. */
  record: VendorRecord | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: VendorFormValues) => void
}

/**
 * Adding or correcting one vendor.
 *
 * The same form for both, because they take the same three values. What is
 * deliberately *not* here is the vendor code — it is allocated by the server
 * from an atomic counter, so there is nothing for a form to offer — and the
 * status, which has its own dialog because moving a vendor between lifecycle
 * states stops new assignments and that is worth saying out loud rather than
 * burying beside a change of address.
 *
 * Grouped into two sections rather than one flat column, as CLAUDE.md asks:
 * who the vendor is, and how to reach them.
 */
export function VendorFormDialog({
  record,
  open,
  isPending,
  onOpenChange,
  onSubmit,
}: VendorFormDialogProps) {
  const t = useT()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: EMPTY,
    mode: 'onTouched',
  })

  /**
   * Reloads whenever the dialog opens on a different vendor. Without it the
   * form would keep the previous one's values, which on a directory of
   * similarly named transport firms is how the wrong one gets edited.
   */
  useEffect(() => {
    if (!open) {
      return
    }
    reset(
      record
        ? { name: record.name, mobile: record.mobile, address: record.address }
        : EMPTY,
    )
  }, [open, record, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {record ? t('vendor.directory.editVendor') : t('vendor.directory.add')}
          </DialogTitle>
          <DialogDescription>
            {record
              ? t('vendor.directory.editDescription')
              : t('vendor.directory.addDescription')}
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          aria-busy={isPending}
        >
          <FormSection title={t('vendor.directory.information')}>
            <div className="space-y-1.5">
              <Label htmlFor="vendor-name">{t('vendor.directory.nameLabel')}</Label>
              <Input
                id="vendor-name"
                autoComplete="organization"
                disabled={isPending}
                aria-invalid={errors.name ? true : undefined}
                {...register('name')}
              />
              <FieldError error={errors.name?.message} />
            </div>
          </FormSection>

          <FormSection title={t('vendor.driver.contact')}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="vendor-mobile">{t('vendor.driver.mobileNumber')}</Label>
                <Input
                  id="vendor-mobile"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  disabled={isPending}
                  aria-invalid={errors.mobile ? true : undefined}
                  {...register('mobile')}
                />
                <FieldError error={errors.mobile?.message} />
                <p className="text-xs leading-snug text-muted-foreground">
                  {t('vendor.directory.mobileHint')}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vendor-address">{t('vendor.driver.address')}</Label>
              <Textarea
                id="vendor-address"
                rows={3}
                disabled={isPending}
                aria-invalid={errors.address ? true : undefined}
                {...register('address')}
              />
              <FieldError error={errors.address?.message} />
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
              {record ? t('common.actions.saveChanges') : t('vendor.directory.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
