import * as z from 'zod'
import type { LocationType } from '@/features/location/types'
import { RATE_KINDS } from '../types'
import type { ProductRateRecord, Rate } from '../types'

/**
 * The rate form's shape, and the two conversions either side of it.
 *
 * Mirrors `product-rate.validation.ts`. The server enforces these; this exists
 * so an Admin sees the problem beside the field rather than in a toast after a
 * round trip. Change one, change both.
 *
 * Every figure is held as a **string** while it is being typed, and converted
 * once on submit. A number input that coerces as you type turns a half-typed
 * "1" into a rate of one, and an empty box into a rate of zero — and zero is a
 * price, so that particular slip is one nobody would catch.
 */

/** The three columns, under keys that are safe as form field paths. */
export const RATE_COLUMNS = [
  { key: 'isd', locationType: 'ISD' as LocationType, label: 'ISD' },
  { key: 'osdMetro', locationType: 'OSD-Metro' as LocationType, label: 'OSD-Metro' },
  { key: 'osdThana', locationType: 'OSD-Thana' as LocationType, label: 'OSD-Thana' },
] as const

export type RateColumnKey = (typeof RATE_COLUMNS)[number]['key']

function amountIssue(value: string): string | null {
  if (value.trim() === '') {
    return 'Enter a rate.'
  }
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return 'That is not a number.'
  }
  if (parsed < 0) {
    return 'A rate cannot be negative.'
  }
  if (parsed > 10_000_000) {
    return 'That looks too large. Check the card.'
  }
  return null
}

const rateFieldsSchema = z
  .object({
    kind: z.enum(RATE_KINDS),
    /**
     * Undefaulted on purpose. A `.default('')` would make these optional on
     * the schema's *input* side, and react-hook-form's resolver types then
     * stop matching the form state — the fields are always present here,
     * because `EMPTY_FORM` supplies every one of them.
     */
    amount: z.string(),
    firstQty: z.string(),
    firstAmount: z.string(),
    restAmount: z.string(),
  })
  .superRefine((value, ctx) => {
    /**
     * Only the fields the chosen kind actually uses are checked. The other
     * half is left holding whatever was last typed into it, so switching from
     * tiered back to flat and changing your mind again does not lose the
     * figures — and since only the used half is read on submit, the unused one
     * cannot reach the server.
     */
    if (value.kind === 'flat') {
      const issue = amountIssue(value.amount)
      if (issue) {
        ctx.addIssue({ code: 'custom', message: issue, path: ['amount'] })
      }
      return
    }

    const qty = Number(value.firstQty)
    if (
      value.firstQty.trim() === '' ||
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > 100_000
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a whole number of pieces, at least one.',
        path: ['firstQty'],
      })
    }

    for (const field of ['firstAmount', 'restAmount'] as const) {
      const issue = amountIssue(value[field])
      if (issue) {
        ctx.addIssue({ code: 'custom', message: issue, path: [field] })
      }
    }
  })

export const productRateFormSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2, 'Product must be at least 2 characters')
    .max(200, 'Product must be 200 characters or fewer'),
  /**
   * Optional, and blank is meaningful: a row with no model prices its product
   * whatever model a challan line names. The form says so out loud rather than
   * leaving somebody to type "NA", which the server would reduce to blank
   * anyway.
   */
  productModel: z.string().trim().max(120, 'Model must be 120 characters or fewer'),
  capacity: z.string().trim().max(120, 'Capacity must be 120 characters or fewer'),
  isActive: z.boolean(),
  isd: rateFieldsSchema,
  osdMetro: rateFieldsSchema,
  osdThana: rateFieldsSchema,
})

export type ProductRateFormState = z.infer<typeof productRateFormSchema>

export type RateFieldsState = ProductRateFormState['isd']

const EMPTY_RATE: RateFieldsState = {
  kind: 'flat',
  amount: '',
  firstQty: '5',
  firstAmount: '',
  restAmount: '',
}

export const EMPTY_FORM: ProductRateFormState = {
  productName: '',
  productModel: '',
  capacity: '',
  isActive: true,
  isd: EMPTY_RATE,
  osdMetro: EMPTY_RATE,
  osdThana: EMPTY_RATE,
}

/** A stored rate as the strings the form edits. */
function toFields(rate: Rate | null): RateFieldsState {
  if (!rate) {
    return EMPTY_RATE
  }

  return rate.kind === 'flat'
    ? { ...EMPTY_RATE, kind: 'flat', amount: String(rate.amount) }
    : {
        kind: 'tiered',
        amount: '',
        firstQty: String(rate.firstQty),
        firstAmount: String(rate.firstAmount),
        restAmount: String(rate.restAmount),
      }
}

export function formStateFrom(record: ProductRateRecord): ProductRateFormState {
  return {
    productName: record.productName,
    productModel: record.productModel,
    capacity: record.capacity,
    isActive: record.isActive,
    isd: toFields(record.rates.ISD),
    osdMetro: toFields(record.rates['OSD-Metro']),
    osdThana: toFields(record.rates['OSD-Thana']),
  }
}

/**
 * The typed strings as a rate.
 *
 * Only the fields the chosen kind uses are read, which is what lets the other
 * half keep stale text without it ever reaching the server.
 */
export function toRate(fields: RateFieldsState): Rate {
  return fields.kind === 'flat'
    ? { kind: 'flat', amount: Number(fields.amount) }
    : {
        kind: 'tiered',
        firstQty: Number(fields.firstQty),
        firstAmount: Number(fields.firstAmount),
        restAmount: Number(fields.restAmount),
      }
}

/**
 * The form as the API takes it.
 *
 * A rate the form could not read comes back as null and is caught by the
 * schema before this ever runs, so every value here is a figure somebody
 * actually typed.
 */
export function toRates(state: ProductRateFormState): Record<LocationType, Rate> {
  return {
    ISD: toRate(state.isd),
    'OSD-Metro': toRate(state.osdMetro),
    'OSD-Thana': toRate(state.osdThana),
  }
}
