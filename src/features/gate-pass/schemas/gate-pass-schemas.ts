import * as z from 'zod'
import { GATE_PASS_REFERENCE_TYPES } from '../types'

/**
 * The entry form contract, mirroring
 * `LBTS-Backend/src/modules/gate-pass/gate-pass.validation.ts`. The server is
 * what actually enforces these; this exists so an operator sees the problem
 * beside the field instead of in a toast after a round trip.
 *
 * The rules are deliberately identical, message for message where it matters.
 * Change one, change both.
 *
 * **Every message here is a translation key**, the arrangement `auth-schemas.ts`
 * established: a schema is built once at module scope and cannot re-run for a
 * language change, so the key is carried through React Hook Form and resolved
 * where it is drawn — by `EntryField` here, and by `FormField` in the auth and
 * profile forms. An unknown key resolves to itself, which is what lets a
 * message the API wrote pass through the same path untouched.
 *
 * It is also why nothing here interpolates: a key is one string, so the field
 * name and the ceiling are spelled into their own messages rather than pushed
 * in at validation time.
 */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/** A code typed off the paper: required, and capped. */
function identifier(max: number, requiredKey: string, tooLongKey: string) {
  return z.string().trim().min(1, requiredKey).max(max, tooLongKey)
}

/** Mirrors MAX_GATE_PASS_ITEMS in the backend's gate-pass.constants.ts. */
export const MAX_GATE_PASS_ITEMS = 50

/**
 * One product row, as the form holds it.
 *
 * `qty` is a string here and a number in the payload: a number input hands
 * back a string, and an empty one hands back ''. Coercing '' would produce 0
 * and a confusing "must be at least 1", so the empty case is named before any
 * coercion happens.
 */
const gatePassItemFormSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2, 'gatePass.validation.productTooShort')
    .max(160, 'gatePass.validation.productTooLong'),
  model: identifier(
    80,
    'gatePass.validation.modelRequired',
    'gatePass.validation.modelTooLong',
  ),
  qty: z
    .string()
    .trim()
    .min(1, 'gatePass.validation.qtyRequired')
    .refine((value) => /^\d+$/.test(value), 'gatePass.validation.qtyWhole')
    .refine(
      (value) => Number.parseInt(value, 10) >= 1,
      'gatePass.validation.qtyAtLeastOne',
    )
    .refine(
      (value) => Number.parseInt(value, 10) <= 100000,
      'gatePass.validation.qtyTooLarge',
    ),
})

export type GatePassItemFormValues = z.infer<typeof gatePassItemFormSchema>

/** A blank product row, which is what "Add another product" appends. */
export const EMPTY_ITEM: GatePassItemFormValues = {
  productName: '',
  model: '',
  qty: '',
}

export const gatePassFormSchema = z
  .object({
    tripDo: identifier(
      60,
      'gatePass.validation.tripDoRequired',
      'gatePass.validation.tripDoTooLong',
    ),
    tripDate: z
      .string()
      .trim()
      .min(1, 'gatePass.validation.tripDateRequired')
      .regex(DATE_ONLY, 'gatePass.validation.tripDateInvalid')
      .refine((value) => {
        const year = Number.parseInt(value.slice(0, 4), 10)
        return year >= 2000 && year <= 2100
      }, 'gatePass.validation.tripDateOutOfRange'),
    csd: identifier(
      24,
      'gatePass.validation.csdRequired',
      'gatePass.validation.csdTooLong',
    ),
    unit: identifier(
      24,
      'gatePass.validation.unitRequired',
      'gatePass.validation.unitTooLong',
    ),
    customerName: z
      .string()
      .trim()
      .min(2, 'gatePass.validation.customerTooShort')
      .max(160, 'gatePass.validation.customerTooLong'),
    vehicleNo: identifier(
      60,
      'gatePass.validation.vehicleRequired',
      'gatePass.validation.vehicleTooLong',
    ).min(3, 'gatePass.validation.vehicleTooShort'),
    /**
     * One row per product on the vehicle. Zod reports a failure at
     * `items.1.model`, which is the path React Hook Form reads to put the
     * message beside the box that is actually wrong.
     */
    items: z
      .array(gatePassItemFormSchema)
      .min(1, 'gatePass.validation.itemsAtLeastOne')
      .max(MAX_GATE_PASS_ITEMS, 'gatePass.validation.itemsTooMany'),

    referenceType: z.enum(GATE_PASS_REFERENCE_TYPES),
    zone: z.string().trim().max(60, 'gatePass.validation.zoneTooLong'),
    po: z.string().trim().max(60, 'gatePass.validation.poTooLong'),
  })
  .superRefine((value, ctx) => {
    // Reported against the field the operator would go and fix, not against
    // the type selector that is already showing the right thing.
    if (value.referenceType === 'Zone' && value.zone.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['zone'],
        message: 'gatePass.validation.zoneRequired',
      })
    }
    if (value.referenceType === 'PO' && value.po.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['po'], message: 'gatePass.validation.poRequired' })
    }
  })

export type GatePassFormValues = z.infer<typeof gatePassFormSchema>

/**
 * An empty form. Every field is a controlled string, including `qty`, so React
 * Hook Form never has to reconcile an uncontrolled input becoming controlled.
 */
export const EMPTY_GATE_PASS_FORM: GatePassFormValues = {
  tripDo: '',
  tripDate: '',
  csd: '',
  unit: '',
  customerName: '',
  vehicleNo: '',
  // One blank row, because every gate pass carries at least one product and an
  // empty list would open the form with nowhere to type.
  items: [{ ...EMPTY_ITEM }],
  referenceType: 'None',
  zone: '',
  po: '',
}

/** The reviewer's decision, when they are sending a record back. */
export const reviewNoteSchema = z.object({
  note: z.string().trim().max(400, 'gatePass.validation.noteTooLong'),
})

export type ReviewNoteValues = z.infer<typeof reviewNoteSchema>
