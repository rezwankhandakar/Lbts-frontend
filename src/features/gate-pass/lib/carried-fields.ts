/**
 * What a new gate pass keeps from the last one filed.
 *
 * A stack of challans out of one depot on one day repeats the trip date, the
 * CSD and the unit exactly, and very often the customer and the lorry too —
 * ten sheets for one customer on one vehicle is an ordinary morning. Retyping
 * those five is where transcription errors come from.
 *
 * What is *not* here is the point of the list: the Trip DO and the goods start
 * empty every time, because carrying one of those over is how the wrong trip
 * gets filed against the wrong paper.
 *
 * Nothing is filled in by itself. Each of the five shows what the last gate
 * pass held above the box, beside a tick — and the box stays empty until that
 * tick is pressed. A pre-filled field looks exactly like one somebody has
 * already checked against the sheet in their hand, and on a customer or a
 * plate that is how a delivery gets filed against the wrong paper.
 *
 * How the tick behaves is `hooks/use-carry-over.ts`, shared with Challan,
 * which files a stack out of one PDF and repeats values sheet after sheet for
 * the same reason.
 *
 * Import-free on purpose, so the field list is one value rather than a
 * constant the form and the workspace each spell out for themselves.
 */

export const CARRIED_FIELDS = [
  'tripDate',
  'csd',
  'unit',
  'customerName',
  'vehicleNo',
] as const

export type CarriedField = (typeof CARRIED_FIELDS)[number]

/** The five values, as the last gate pass left them. */
export type CarriedValues = Record<CarriedField, string>

/** What each tick box calls its field, when it names it out loud. */
export const CARRIED_LABELS: Record<CarriedField, string> = {
  tripDate: 'Trip date',
  csd: 'CSD',
  unit: 'Unit',
  customerName: 'Customer name',
  vehicleNo: 'Vehicle number',
}

/**
 * The carried five out of a full set of form values.
 *
 * Takes anything holding the five strings rather than the form type itself,
 * which is what keeps this file free of the schema — and free of zod, and
 * therefore loadable by anything.
 */
export function carriedValuesOf(source: CarriedValues): CarriedValues {
  return {
    tripDate: source.tripDate,
    csd: source.csd,
    unit: source.unit,
    customerName: source.customerName,
    vehicleNo: source.vehicleNo,
  }
}

/**
 * Whether there is anything worth offering.
 *
 * A gate pass filed with every carried field blank cannot happen — four of the
 * five are required — but a set of empty strings would still draw five tick
 * boxes that restore nothing, so the question is asked rather than assumed.
 */
export function hasCarriedValues(values: CarriedValues | null): boolean {
  if (!values) {
    return false
  }
  return CARRIED_FIELDS.some((field) => values[field].trim().length > 0)
}

