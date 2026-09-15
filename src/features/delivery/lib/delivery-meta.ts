import { CircleCheckBig, FileQuestion, PackageCheck, Truck, Undo2, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type {
  CarryingKind,
  ChallanChange,
  CompletionMethod,
  DeliveryOutcome,
  LineChange,
  TripStatus,
} from '../types'

/**
 * Display metadata for the Delivery vocabulary, in the shape `vendor-meta.ts`
 * and `lib/roles.ts` use — colour for a classification belongs in one table,
 * never inline in a component.
 *
 * Every class is a full literal string: Tailwind scans source text, so a
 * template like `text-tone-${tone}` would generate nothing.
 */

export interface TripStatusMeta {
  label: string
  description: string
  icon: LucideIcon
  badge: string
  dot: string
  /** The icon tile in a stat card. */
  tile: string
}

export const TRIP_STATUS_META: Record<TripStatus, TripStatusMeta> = {
  /**
   * Stored as `Open`, read as "Awaiting copy": the word says what the trip is
   * waiting for, and the badge adds how far along it is (`· 2/3`). Only the
   * label changed — the value, the filter and every query still say `Open`.
   */
  Open: {
    label: 'Awaiting copy',
    description: 'A challan on this trip is still waiting for its signed copy.',
    icon: Truck,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    dot: 'bg-tone-amber',
    tile: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
  },
  Completed: {
    label: 'Completed',
    description: 'Every challan on the trip has been signed for.',
    icon: CircleCheckBig,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    tile: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
}

export function tripStatusMeta(value: string): TripStatusMeta {
  return TRIP_STATUS_META[value as TripStatus] ?? TRIP_STATUS_META.Open
}

/**
 * A trip number as it is read rather than as it is stored — see
 * `shortTripNumber` in `cart.ts`, the import-free file that owns it so
 * `node --test` can load it.
 */
export { shortTripNumber } from './cart'

// --- Completing a delivery -------------------------------------------------

export interface DeliveryOutcomeMeta {
  label: string
  description: string
  icon: LucideIcon
  badge: string
  dot: string
}

/**
 * What one challan's delivery amounts to.
 *
 * Drawn in **both** states, unlike the backlog chips on a challan list: an
 * absent badge here would read as "no information" rather than "not signed for
 * yet", and the challan still waiting for its copy is precisely the one
 * somebody is looking for.
 */
export const DELIVERY_OUTCOME_META: Record<DeliveryOutcome, DeliveryOutcomeMeta> = {
  Pending: {
    label: 'Awaiting copy',
    description: 'The signed challan copy has not been scanned in yet.',
    icon: Truck,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    dot: 'bg-tone-amber',
  },
  Complete: {
    label: 'Complete',
    description: 'The receiver signed for it and the copy is on record.',
    icon: PackageCheck,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
  },
}

export function deliveryOutcomeMeta(value: string): DeliveryOutcomeMeta {
  return DELIVERY_OUTCOME_META[value as DeliveryOutcome] ?? DELIVERY_OUTCOME_META.Pending
}

/**
 * The three ways a delivery is complete, each drawn as its own word — "Complete"
 * alone would hide that one of them has no signed copy behind it.
 */
export const COMPLETION_METHOD_META: Record<CompletionMethod, DeliveryOutcomeMeta> = {
  SignedCopy: DELIVERY_OUTCOME_META.Complete,
  Returned: {
    label: 'Returned',
    description: 'Everything came back. Nothing was delivered, so no signed copy is needed.',
    icon: Undo2,
    badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
    dot: 'bg-tone-rose',
  },
  CopyMissing: {
    label: 'Copy missing',
    description: 'Completed without the signed copy, on the operator’s word.',
    icon: FileQuestion,
    badge: 'border-tone-orange/25 bg-tone-orange/10 text-tone-orange',
    dot: 'bg-tone-orange',
  },
}

/** A delivery's badge meta: why it is complete when it is, else awaiting copy. */
export function completionMeta(challan: {
  outcome: string
  completionMethod: CompletionMethod | null
}): DeliveryOutcomeMeta {
  return challan.outcome === 'Complete' && challan.completionMethod
    ? COMPLETION_METHOD_META[challan.completionMethod]
    : deliveryOutcomeMeta(challan.outcome)
}

export interface CarryingKindMeta {
  label: string
  hint: string
  icon: LucideIcon
}

/** What was hired for the last few metres — a vehicle, or people. */
export const CARRYING_KIND_META: Record<CarryingKind, CarryingKindMeta> = {
  Vehicle: {
    label: 'Vehicle',
    hint: 'A rickshaw van, a CNG — whatever took it the last stretch.',
    icon: Truck,
  },
  Labour: {
    label: 'Labour',
    hint: 'People hired to carry it in or up.',
    icon: Users,
  },
}

/** The returns badge, used wherever a line or a challan reports one. */
export const RETURN_META = {
  label: 'Returned',
  icon: Undo2,
  badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
} as const

/**
 * A floor, as a person says it. `null` is nobody said, and `0` is the ground
 * floor — two different answers, and a dash for the first would read as the
 * second.
 */
export function floorLabel(floorNo: number | null): string {
  if (floorNo === null) {
    return 'Not recorded'
  }
  if (floorNo === 0) {
    return 'Ground floor'
  }
  const suffix = floorNo % 10 === 1 && floorNo % 100 !== 11
    ? 'st'
    : floorNo % 10 === 2 && floorNo % 100 !== 12
      ? 'nd'
      : floorNo % 10 === 3 && floorNo % 100 !== 13
        ? 'rd'
        : 'th'
  return `${floorNo}${suffix} floor`
}

/** Taka, as this operation writes it. */
export function taka(amount: number): string {
  return `৳${amount.toLocaleString()}`
}

export interface LineChangeMeta {
  label: string
  description: string
  badge: string
}

/**
 * What a trip did to a challan line. `as-ordered` is never drawn — a manifest
 * where every unchanged line carries a green tick is a manifest where the four
 * lines that matter are hidden among thirty that do not.
 *
 * `split` and `reduced` look the same on a lorry and mean opposite things on
 * paper, so they are two words: a split leaves the rest on the challan for
 * another trip, a cut takes it off the challan for good.
 */
export const LINE_CHANGE_META: Record<LineChange, LineChangeMeta> = {
  'as-ordered': {
    label: 'As ordered',
    description: 'The product, the model and the quantity the challan orders.',
    badge: 'border-border bg-muted text-muted-foreground',
  },
  split: {
    label: 'Split',
    description: 'Part of this line goes on a later trip. The challan keeps the rest.',
    badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
  },
  reduced: {
    label: 'Cut',
    description:
      'Fewer than the challan orders, with nothing held back — the challan is corrected down to what went.',
    badge: 'border-tone-orange/25 bg-tone-orange/10 text-tone-orange',
  },
  increased: {
    label: 'More',
    description: 'More than the challan orders — the challan is corrected up to what went.',
    badge: 'border-tone-orange/25 bg-tone-orange/10 text-tone-orange',
  },
  substituted: {
    label: 'Replaced',
    description:
      'A different product or model standing in for the one on the challan, which it replaces there too.',
    badge: 'border-tone-violet/25 bg-tone-violet/10 text-tone-violet',
  },
  added: {
    label: 'Added',
    description: 'A product the challan never listed. It is added to the challan as well.',
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
  },
}

const CHANGE_VERB: Record<ChallanChange['kind'], string> = {
  reduced: 'cut to',
  increased: 'raised to',
  removed: 'removed',
  added: 'added',
}

/**
 * One change a trip makes to a challan, as a sentence somebody can check
 * against the paper: "Refrigerator WFN-1D5 cut to 3 (was 4)".
 */
export function changeSentence(change: ChallanChange): string {
  const product = `${change.productName} ${change.model}`.trim()

  switch (change.kind) {
    case 'removed':
      return `${product} removed (was ${change.from})`
    case 'added':
      return `${product} added (${change.to})`
    default:
      return `${product} ${CHANGE_VERB[change.kind]} ${change.to} (was ${change.from})`
  }
}

/** The numbers behind a line's change badge — "2 of 4", "for WFA-2D4" — when there are any. */
export function lineDetail(line: {
  change: LineChange
  qty: number
  source: { model: string; qty: number } | null
}): string | undefined {
  if (!line.source) {
    return undefined
  }
  switch (line.change) {
    case 'split':
      return `${line.qty} of ${line.source.qty} · rest on another trip`
    case 'reduced':
    case 'increased':
      return `challan was ${line.source.qty}`
    case 'substituted':
      return `for ${line.source.model}`
    default:
      return undefined
  }
}

/** Labels for the delivery fields a trip may correct. */
export const PARTY_LABELS = {
  customerName: 'Customer',
  deliveryAddress: 'Delivery address',
  thana: 'Thana',
  district: 'District',
  receiverMobile: 'Receiver',
} as const

/**
 * Thana and district for a card: what the challan printed, or — when it
 * printed nothing — where the Location master resolved it, so a blank on the
 * paper does not become a blank for the driver. A dash when neither knows.
 */
export function whereOf(entry: {
  thana: string
  district: string
  location: { thana: string; district: string } | null
}): { thana: string; district: string } {
  return {
    thana: entry.thana || entry.location?.thana || '—',
    district: entry.district || entry.location?.district || '—',
  }
}

/**
 * Today as a calendar day in the viewer's own timezone — what a trip date
 * defaults to and what "today" means on the stats. Deliberately local rather
 * than `toISOString()`, which is UTC and would say yesterday for an operator
 * in Dhaka before six in the morning.
 */
export function localToday(): string {
  return toDayString(new Date())
}

/** A local date as `YYYY-MM-DD`. */
function toDayString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/**
 * A whole calendar month as a date range, in the viewer's own timezone:
 * `0` is this month, `-1` last month. Day zero of the following month is the
 * last day of this one, whatever its length.
 */
export function monthRange(offset: 0 | -1): { from: string; to: string } {
  const now = new Date()
  return {
    from: toDayString(new Date(now.getFullYear(), now.getMonth() + offset, 1)),
    to: toDayString(new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)),
  }
}

/** A fresh idempotency key for one confirmation. */
export function newSubmissionKey(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count.toLocaleString()} ${count === 1 ? one : many}`
}
