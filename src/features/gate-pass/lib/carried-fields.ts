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

/**
 * What the form hands each carried field's tick box.
 *
 * `values` is what the last gate pass filed left behind, shown above the box
 * whether or not it is used; `kept` is which fields are currently holding it.
 * Ticked, the field **is** that value and is read-only. Unticked, the field is
 * empty unless somebody typed in it, and what they typed is what gets filed.
 *
 * That is the whole rule, and it is why the tick can never lie about what will
 * be filed. The form drops a tick the moment its field stops matching, so
 * there is no state in which a box says "same as last" over a different value.
 */
export interface CarryControls {
  values: CarriedValues | null
  kept: Partial<Record<CarriedField, boolean>>
  toggle: (field: CarriedField, next: boolean) => void
  /** The gate pass the values came from, for the label that names it. */
  gatePassId: string | null
}

/** Whether this field is currently pinned, and therefore read-only. */
export function isKept(carry: CarryControls | undefined, field: CarriedField): boolean {
  return Boolean(carry?.values && carry.kept[field])
}
