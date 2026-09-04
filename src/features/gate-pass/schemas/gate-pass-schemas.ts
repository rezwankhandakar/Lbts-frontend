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
 */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

function identifier(max: number, label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`)
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
    .min(2, 'Product name must be at least 2 characters')
    .max(160, 'Product name must be 160 characters or fewer'),
  model: identifier(80, 'Model'),
  qty: z
    .string()
    .trim()
    .min(1, 'Quantity is required')
    .refine((value) => /^\d+$/.test(value), 'Quantity must be a whole number')
    .refine((value) => Number.parseInt(value, 10) >= 1, 'Quantity must be at least 1')
    .refine(
      (value) => Number.parseInt(value, 10) <= 100000,
      'Quantity looks too large. Check the challan.',
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
    tripDo: identifier(60, 'Trip DO'),
    tripDate: z
      .string()
      .trim()
      .min(1, 'Trip date is required')
      .regex(DATE_ONLY, 'Enter a valid date')
      .refine((value) => {
        const year = Number.parseInt(value.slice(0, 4), 10)
        return year >= 2000 && year <= 2100
      }, 'That date is outside the range this system records'),
    csd: identifier(24, 'CSD'),
    unit: identifier(24, 'Unit'),
    customerName: z
      .string()
      .trim()
      .min(2, 'Customer name must be at least 2 characters')
      .max(160, 'Customer name must be 160 characters or fewer'),
    vehicleNo: identifier(60, 'Vehicle number').min(
      3,
      'Vehicle number must be at least 3 characters',
    ),
    /**
     * One row per product on the vehicle. Zod reports a failure at
     * `items.1.model`, which is the path React Hook Form reads to put the
     * message beside the box that is actually wrong.
     */
    items: z
      .array(gatePassItemFormSchema)
      .min(1, 'Add at least one product')
      .max(MAX_GATE_PASS_ITEMS, `A gate pass can carry at most ${MAX_GATE_PASS_ITEMS} products`),

    referenceType: z.enum(GATE_PASS_REFERENCE_TYPES),
    zone: z.string().trim().max(60, 'Zone must be 60 characters or fewer'),
    po: z.string().trim().max(60, 'PO must be 60 characters or fewer'),
  })
  .superRefine((value, ctx) => {
    // Reported against the field the operator would go and fix, not against
    // the type selector that is already showing the right thing.
    if (value.referenceType === 'Zone' && value.zone.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['zone'], message: 'Enter the zone.' })
    }
    if (value.referenceType === 'PO' && value.po.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['po'], message: 'Enter the PO number.' })
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

/** The reviewer's decision, when they are rejecting or cancelling a record. */
export const reviewNoteSchema = z.object({
  note: z.string().trim().max(400, 'Note must be 400 characters or fewer'),
})

export type ReviewNoteValues = z.infer<typeof reviewNoteSchema>
