import * as z from 'zod'
import { MAX_CHALLAN_ITEMS } from '../types'
import type { ChallanItem, ChallanValues } from '../types'

/**
 * The entry form contract, mirroring
 * `LBTS-Backend/src/modules/challan/challan.validation.ts`. The server is what
 * actually enforces these; this exists so an operator sees the problem beside
 * the field instead of in a toast after a round trip — and, on this form more
 * than most, before a PDF has been built and an SL number burned.
 *
 * The rules are deliberately identical, message for message where it matters.
 * Change one, change both.
 */

function text(min: number, max: number, label: string) {
  return z
    .string()
    .trim()
    .min(min, min === 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
    .max(max, `${label} must be ${max} characters or fewer`)
}

/**
 * A contact number. The server normalises the recognised forms down to the
 * eleven-digit local one, so this only has to accept them — reproducing the
 * normalisation here would give the operator a value that changed under them
 * after saving.
 */
const MOBILE = /^(?:\+?880)?1\d{9}$/
const LOOSE_CONTACT = /^[\d+\-() ]{6,20}$/

function mobile(label: string) {
  return z
    .string()
    .trim()
    .refine((value) => {
      const digits = value.replace(/[^\d+]/g, '')
      return MOBILE.test(digits) || LOOSE_CONTACT.test(value)
    }, `Enter a valid ${label.toLowerCase()}, for example 01712345678.`)
}

/**
 * One product row, as the form holds it.
 *
 * `qty` is a string here and a number in the payload: a number input hands
 * back a string, and an empty one hands back ''. Coercing '' would produce 0
 * and a confusing "must be at least 1", so the empty case is named before any
 * coercion happens — the same reasoning the gate pass form uses.
 */
const challanItemFormSchema = z.object({
  productName: text(2, 200, 'Product'),
  model: text(1, 120, 'Model'),
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

export type ChallanItemFormValues = z.infer<typeof challanItemFormSchema>

/** A blank product row, which is what "Add another product" appends. */
export const EMPTY_ITEM: ChallanItemFormValues = { productName: '', model: '', qty: '' }

/**
 * The values the form holds.
 */
export const challanFormSchema = z.object({
  customerName: text(2, 200, 'Customer name'),
  deliveryAddress: text(3, 500, 'Delivery address'),
  /**
   * The thana and district as transcribed — **optional**.
   *
   * A Walton challan does not always print them, and a required field would
   * mean an operator inventing one to get past the form. An invented district
   * is a worse record than a blank: it is wrong, and nothing downstream can
   * tell. The server matches whatever is here against the Location Master and
   * leaves the result blank rather than guessing.
   */
  thana: z.string().trim().max(120, 'Thana must be 120 characters or fewer'),
  district: z.string().trim().max(120, 'District must be 120 characters or fewer'),
  /**
   * The Location Master row the operator picked, if they picked one. An id or
   * nothing — every value written to the record is read from the row it points
   * at, server-side.
   */
  locationId: z.string().trim().max(40),
  receiverMobile: mobile('Receiver mobile'),
  /** Optional: many challans carry only the receiver's number. */
  senderMobile: z
    .string()
    .trim()
    .max(40, 'Sender mobile must be 40 characters or fewer')
    .refine(
      (value) => value.length === 0 || LOOSE_CONTACT.test(value),
      'Enter a valid sender mobile, or leave it blank.',
    ),
  zonePo: z.string().trim().max(120, 'Zone / PO must be 120 characters or fewer'),
  /**
   * One row per product on the challan. Zod reports a failure at
   * `items.1.model`, which is the path React Hook Form reads to put the
   * message beside the box that is actually wrong.
   */
  items: z
    .array(challanItemFormSchema)
    .min(1, 'Add at least one product')
    .max(MAX_CHALLAN_ITEMS, `A challan can carry at most ${MAX_CHALLAN_ITEMS} products`),
})

export type ChallanFormValues = z.infer<typeof challanFormSchema>

/**
 * An empty form. Every field is a controlled string, including `qty`, so React
 * Hook Form never has to reconcile an uncontrolled input becoming controlled.
 *
 * There is no default value anywhere in here on purpose, and no placeholders
 * on the fields either: a sample value greyed out inside an empty box reads as
 * a filled field often enough to matter, and on a form transcribed from a PDF
 * it invites somebody to leave the example in.
 */
export const EMPTY_CHALLAN_FORM: ChallanFormValues = {
  customerName: '',
  deliveryAddress: '',
  thana: '',
  district: '',
  locationId: '',
  receiverMobile: '',
  senderMobile: '',
  zonePo: '',
  // One blank row, because every challan carries at least one product and an
  // empty list would open the form with nowhere to type.
  items: [{ ...EMPTY_ITEM }],
}

/** The form's strings, as the API wants them. */
export function toChallanValues(values: ChallanFormValues): ChallanValues {
  return {
    customerName: values.customerName,
    deliveryAddress: values.deliveryAddress,
    thana: values.thana,
    district: values.district,
    locationId: values.locationId,
    receiverMobile: values.receiverMobile,
    senderMobile: values.senderMobile,
    zonePo: values.zonePo,
    // The form holds every quantity as a string, because that is what a number
    // input gives back; the payload wants numbers.
    items: values.items.map((item) => ({
      productName: item.productName,
      model: item.model,
      qty: Number.parseInt(item.qty, 10),
    })),
  }
}

/**
 * A saved record, back in the shape the form holds it.
 *
 * `locationId` defaults to empty rather than being seeded from the record's
 * existing resolution, and that is deliberate. Sending an id tells the server
 * "a person chose this", which is the one resolution nothing may overwrite —
 * so seeding it would quietly convert every automatically matched location
 * into a manual one the first time somebody fixed a typo in a customer name.
 * The operator picking a location in the panel is what sets it.
 */
export function toFormValues(
  record: {
    customerName: string
    deliveryAddress: string
    thana: string
    district: string
    receiverMobile: string
    senderMobile: string | null
    zonePo: string | null
    items: ChallanItem[]
  },
  locationId = '',
): ChallanFormValues {
  return {
    customerName: record.customerName,
    deliveryAddress: record.deliveryAddress,
    thana: record.thana,
    district: record.district,
    locationId,
    receiverMobile: record.receiverMobile,
    senderMobile: record.senderMobile ?? '',
    zonePo: record.zonePo ?? '',
    items:
      record.items.length > 0
        ? record.items.map((item) => ({
            productName: item.productName,
            model: item.model,
            qty: String(item.qty),
          }))
        : [{ ...EMPTY_ITEM }],
  }
}

/**
 * Values kept in the session queue, back in the shape the form holds them.
 *
 * The chosen location comes back with them: switching to another sheet in the
 * tray and back must not lose a selection the operator has already made.
 */
export function fromChallanValues(values: ChallanValues): ChallanFormValues {
  return toFormValues(values, values.locationId)
}
