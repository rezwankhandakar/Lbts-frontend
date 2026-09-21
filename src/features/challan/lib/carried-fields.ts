/**
 * What a new challan keeps from the last one filed out of this session.
 *
 * Two values, and only two. A WhatsApp file is routinely one customer taking
 * the same order to twenty branches, and the zone or PO it is filed against is
 * printed once and repeated down the stack — so the customer and the reference
 * are what an operator types over and over out of one PDF.
 *
 * What is *not* here is the point of the list. The delivery address, the
 * thana, the district, the receiver's number and the goods are what tell one
 * of those twenty deliveries from another, and carrying any of them would file
 * a challan against the wrong branch. The page range is not here either: it is
 * the one value that must differ every time.
 *
 * Nothing is filled in by itself. Each of the two shows what the last challan
 * held above the box, beside a tick — and the box stays empty until that tick
 * is pressed. A pre-filled field looks exactly like one somebody has already
 * checked against the page on the left, and on a customer that is how a
 * delivery gets filed against the wrong paper.
 *
 * How the tick behaves is `hooks/use-carry-over.ts`, shared with Gate Pass,
 * which files a scanned stack and repeats values sheet after sheet for the
 * same reason.
 *
 * Import-free on purpose, so the field list is one value rather than a
 * constant the form and the workspace each spell out for themselves.
 */

export const CARRIED_FIELDS = ['customerName', 'zonePo'] as const

export type CarriedField = (typeof CARRIED_FIELDS)[number]

/** The two values, as the last challan left them. */
export type CarriedValues = Record<CarriedField, string>

/** What each tick box calls its field, when it names it out loud. */
export const CARRIED_LABELS: Record<CarriedField, string> = {
  customerName: 'Customer name',
  zonePo: 'Zone / PO',
}

/**
 * The carried two out of a full set of challan values.
 *
 * Takes anything holding the two strings rather than the form type itself,
 * which is what keeps this file free of the schema — and free of zod, and
 * therefore loadable by anything.
 */
export function carriedValuesOf(source: CarriedValues): CarriedValues {
  return {
    customerName: source.customerName,
    zonePo: source.zonePo,
  }
}

/**
 * Whether there is anything worth offering.
 *
 * `zonePo` is optional on a challan and often blank, so a record filed without
 * it leaves one carried value rather than two — and a challan somehow filed
 * with neither would draw two tick boxes that restore nothing.
 */
export function hasCarriedValues(values: CarriedValues | null): boolean {
  if (!values) {
    return false
  }
  return CARRIED_FIELDS.some((field) => values[field].trim().length > 0)
}
