import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { RotateCcw } from 'lucide-react'
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
import { FieldError } from '@/features/vendor/components/form-parts'
import { PARTY_LABEL_KEYS } from '../lib/delivery-meta'
import type { CartChallan, CartParty } from '../types'
import { useT } from '@/lib/i18n'

/** Mirrors the trip challan fields in `delivery.validation.ts`. */
const partySchema = z.object({
  customerName: z.string().trim().min(1, 'delivery.party.customerRequired').max(200),
  deliveryAddress: z.string().trim().min(1, 'delivery.party.addressRequired').max(500),
  thana: z.string().trim().max(120),
  district: z.string().trim().max(120),
  receiverMobile: z
    .string()
    .trim()
    .refine(
      (value) => /^(?:\+?88)?01\d{9}$/.test(value.replace(/[\s-]/g, '')) || /^[\d+\-() ]{6,20}$/.test(value),
      'delivery.party.mobileInvalid',
    ),
  note: z.string().trim().max(400),
})
type PartyValues = z.infer<typeof partySchema>

interface ChallanPartyDialogProps {
  challan: CartChallan
  onOpenChange: (open: boolean) => void
  onSave: (party: CartParty, note: string) => void
}

const FIELDS: (keyof CartParty)[] = ['customerName', 'receiverMobile', 'thana', 'district']

/**
 * The delivery details **for this trip**.
 *
 * A receiver who gave another number at the gate, an address that needs the
 * landmark the driver will look for — these are corrected here, on the trip's
 * own copy, and the challan is not touched. The challan is the corporate
 * office's paperwork with its own correction path, which regenerates a barcode
 * page; this is what the driver is handed. Each field shows what the challan
 * printed when the two differ, and one button puts them all back.
 *
 * Mounted only while open (the caller keys it on the challan), so the form is
 * seeded once from the cart as it stands and never re-seeded underneath
 * somebody typing.
 */
export function ChallanPartyDialog({ challan, onOpenChange, onSave }: ChallanPartyDialogProps) {
  const t = useT()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartyValues>({
    resolver: zodResolver(partySchema),
    defaultValues: {
      customerName: challan.customerName,
      deliveryAddress: challan.deliveryAddress,
      thana: challan.thana,
      district: challan.district,
      receiverMobile: challan.receiverMobile,
      note: challan.note,
    },
  })

  const values = useWatch({ control })

  const differs = (field: keyof CartParty) =>
    (values[field] ?? '').trim() !== challan.original[field].trim()

  const hint = (field: keyof CartParty) =>
    differs(field) ? (
      <p className="text-[11px] text-tone-amber">
        Challan: {challan.original[field] || <em>blank</em>}
      </p>
    ) : null

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Delivery details · {challan.challanNumber}</DialogTitle>
          <DialogDescription>
            {t('delivery.party.forThisTripOnly')}
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit(({ note, ...party }) => onSave(party, note))}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="party-deliveryAddress">{t(PARTY_LABEL_KEYS.deliveryAddress)}</Label>
            <Textarea id="party-deliveryAddress" rows={2} {...register('deliveryAddress')} />
            <FieldError error={errors.deliveryAddress?.message} />
            {hint('deliveryAddress')}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field} className="space-y-1.5">
                <Label htmlFor={`party-${field}`}>{t(PARTY_LABEL_KEYS[field])}</Label>
                <Input
                  id={`party-${field}`}
                  inputMode={field === 'receiverMobile' ? 'tel' : undefined}
                  aria-invalid={errors[field] ? true : undefined}
                  {...register(field)}
                />
                <FieldError error={errors[field]?.message} />
                {hint(field)}
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="party-note">
              {t('delivery.party.noteForDriver')}{' '}
              <span className="text-muted-foreground">{t('common.labels.optionalSuffix')}</span>
            </Label>
            <Textarea id="party-note" rows={2} {...register('note')} />
            <FieldError error={errors.note?.message} />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              className="sm:mr-auto"
              onClick={() => reset({ ...challan.original, note: values.note ?? '' })}
            >
              <RotateCcw data-icon="inline-start" aria-hidden />
              {t('delivery.party.useChallanDetails')}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button type="submit">{t('delivery.party.saveForTrip')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
