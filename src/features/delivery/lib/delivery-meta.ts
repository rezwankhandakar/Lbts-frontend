import { CircleCheckBig, FileQuestion, PackageCheck, Truck, Undo2, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatNumber, formatTaka } from '@/lib/i18n'
import type { TranslationKey, Translator } from '@/lib/i18n'
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
 *
 * **What each table holds is the untranslatable half.** An icon and a set of
 * classes belong to a classification; the words belong to whoever is reading,
 * so every lookup here takes a `Translator` and reads them from the
 * dictionary. Requiring the argument is what makes that a compiler error
 * rather than a stale label nobody notices after a language switch.
 */

export interface TripStatusMeta extends TripStatusPresentation {
  label: string
  description: string
}

export interface TripStatusPresentation {
  icon: LucideIcon
  badge: string
  dot: string
  /** The icon tile in a stat card. */
  tile: string
}

/**
 * Stored as `Open`, read as "Awaiting copy": the word says what the trip is
 * waiting for, and the badge adds how far along it is (`· 2/3`). Only the
 * label changed — the value, the filter and every query still say `Open`.
 */
export const TRIP_STATUS_META: Record<TripStatus, TripStatusPresentation> = {
  Open: {
    icon: Truck,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    dot: 'bg-tone-amber',
    tile: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
  },
  Completed: {
    icon: CircleCheckBig,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    tile: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
}

export function tripStatusMeta(value: string, t: Translator): TripStatusMeta {
  const status: TripStatus = value in TRIP_STATUS_META ? (value as TripStatus) : 'Open'

  return {
    ...TRIP_STATUS_META[status],
    label: t(`delivery.tripStatuses.${status}.label` as TranslationKey),
    description: t(`delivery.tripStatuses.${status}.description` as TranslationKey),
  }
}

/**
 * A trip number as it is read rather than as it is stored — see
 * `shortTripNumber` in `cart.ts`, the import-free file that owns it so
 * `node --test` can load it.
 */
export { shortTripNumber } from './cart'

// --- Completing a delivery -------------------------------------------------

export interface DeliveryOutcomeMeta extends OutcomePresentation {
  label: string
  description: string
}

interface OutcomePresentation {
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
export const DELIVERY_OUTCOME_META: Record<DeliveryOutcome, OutcomePresentation> = {
  Pending: {
    icon: Truck,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    dot: 'bg-tone-amber',
  },
  Complete: {
    icon: PackageCheck,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
  },
}

export function deliveryOutcomeMeta(value: string, t: Translator): DeliveryOutcomeMeta {
  const outcome: DeliveryOutcome =
    value in DELIVERY_OUTCOME_META ? (value as DeliveryOutcome) : 'Pending'

  return {
    ...DELIVERY_OUTCOME_META[outcome],
    label: t(`delivery.outcomes.${outcome}.label` as TranslationKey),
    description: t(`delivery.outcomes.${outcome}.description` as TranslationKey),
  }
}

/**
 * The two ways a delivery closes without a signature, each drawn as its own
 * word — "Complete" alone would hide that one of them has no signed copy
 * behind it.
 *
 * `SignedCopy` is deliberately absent: it *is* the Complete outcome, and
 * saying so in two tables is how the two come to disagree.
 */
const COMPLETION_METHOD_META: Record<
  Exclude<CompletionMethod, 'SignedCopy'>,
  OutcomePresentation
> = {
  Returned: {
    icon: Undo2,
    badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
    dot: 'bg-tone-rose',
  },
  CopyMissing: {
    icon: FileQuestion,
    badge: 'border-tone-orange/25 bg-tone-orange/10 text-tone-orange',
    dot: 'bg-tone-orange',
  },
}

/** A delivery's badge meta: why it is complete when it is, else awaiting copy. */
export function completionMeta(
  challan: {
    outcome: string
    completionMethod: CompletionMethod | null
  },
  t: Translator,
): DeliveryOutcomeMeta {
  const method = challan.completionMethod
  if (challan.outcome !== 'Complete' || method === null || method === 'SignedCopy') {
    return deliveryOutcomeMeta(challan.outcome, t)
  }

  return {
    ...COMPLETION_METHOD_META[method],
    label: t(`delivery.completionMethods.${method}.label` as TranslationKey),
    description: t(`delivery.completionMethods.${method}.description` as TranslationKey),
  }
}

export interface CarryingKindMeta {
  label: string
  hint: string
  icon: LucideIcon
}

/** What was hired for the last few metres — a vehicle, or people. */
const CARRYING_KIND_ICONS: Record<CarryingKind, LucideIcon> = {
  Vehicle: Truck,
  Labour: Users,
}

export function carryingKindMeta(kind: CarryingKind, t: Translator): CarryingKindMeta {
  return {
    icon: CARRYING_KIND_ICONS[kind],
    label: t(`delivery.carryingKinds.${kind}.label` as TranslationKey),
    hint: t(`delivery.carryingKinds.${kind}.hint` as TranslationKey),
  }
}

/** The returns badge, used wherever a line or a challan reports one. */
export const RETURN_META = {
  labelKey: 'delivery.returned',
  icon: Undo2,
  badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
} as const satisfies { labelKey: TranslationKey; icon: LucideIcon; badge: string }

/**
 * A floor, as a person says it. `null` is nobody said, and `0` is the ground
 * floor — two different answers, and a dash for the first would read as the
 * second.
 *
 * English agrees the ordinal suffix with the number and Bangla does not, so
 * the suffix is not a string this file builds: it chooses between four whole
 * messages, with `Intl.PluralRules` in ordinal mode saying which. Bangla
 * writes the same sentence in all four, which is what a language with no
 * ordinal agreement should do.
 */
const ORDINAL_KEYS: Record<Intl.LDMLPluralRule, TranslationKey> = {
  one: 'delivery.floorSt',
  two: 'delivery.floorNd',
  few: 'delivery.floorRd',
  other: 'delivery.floorTh',
  zero: 'delivery.floorTh',
  many: 'delivery.floorTh',
}

const ORDINAL = new Intl.PluralRules('en', { type: 'ordinal' })

export function floorLabel(floorNo: number | null, t: Translator): string {
  if (floorNo === null) {
    return t('delivery.floorNotRecorded')
  }
  if (floorNo === 0) {
    return t('delivery.groundFloor')
  }
  return t(ORDINAL_KEYS[ORDINAL.select(floorNo)], { n: formatNumber(floorNo) })
}

/** Taka, as this operation writes it. Kept as this module's name for the shared formatter. */
export function taka(amount: number): string {
  return formatTaka(amount)
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
const LINE_CHANGE_BADGES: Record<LineChange, string> = {
  'as-ordered': 'border-border bg-muted text-muted-foreground',
  split: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
  reduced: 'border-tone-orange/25 bg-tone-orange/10 text-tone-orange',
  increased: 'border-tone-orange/25 bg-tone-orange/10 text-tone-orange',
  substituted: 'border-tone-violet/25 bg-tone-violet/10 text-tone-violet',
  added: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
}

export function lineChangeMeta(change: LineChange, t: Translator): LineChangeMeta {
  return {
    badge: LINE_CHANGE_BADGES[change],
    label: t(`delivery.lineChanges.${change}.label` as TranslationKey),
    description: t(`delivery.lineChanges.${change}.description` as TranslationKey),
  }
}

/**
 * One change a trip makes to a challan, as a sentence somebody can check
 * against the paper: "Refrigerator WFN-1D5 cut to 3 (was 4)".
 *
 * Four whole messages rather than a verb dropped into a shared frame: the verb
 * sits between the product and the figure in English and after both in
 * Bangla, so one template could only ever read correctly in one of them.
 */
export function changeSentence(change: ChallanChange, t: Translator): string {
  const values = {
    product: `${change.productName} ${change.model}`.trim(),
    from: formatNumber(change.from),
    to: formatNumber(change.to),
  }

  switch (change.kind) {
    case 'removed':
      return t('delivery.changes.removed', values)
    case 'added':
      return t('delivery.changes.added', values)
    case 'increased':
      return t('delivery.changes.raisedTo', values)
    default:
      return t('delivery.changes.cutTo', values)
  }
}

/** The numbers behind a line's change badge — "2 of 4", "for WFA-2D4" — when there are any. */
export function lineDetail(
  line: {
    change: LineChange
    qty: number
    source: { model: string; qty: number } | null
  },
  t: Translator,
): string | undefined {
  if (!line.source) {
    return undefined
  }
  switch (line.change) {
    case 'split':
      return t('delivery.lineDetail.split', {
        qty: formatNumber(line.qty),
        ordered: formatNumber(line.source.qty),
      })
    case 'reduced':
    case 'increased':
      return t('delivery.lineDetail.corrected', { ordered: formatNumber(line.source.qty) })
    case 'substituted':
      return t('delivery.lineDetail.substituted', { model: line.source.model })
    default:
      return undefined
  }
}

/** Labels for the delivery fields a trip may correct. */
export const PARTY_LABEL_KEYS = {
  customerName: 'delivery.partyLabels.customerName',
  deliveryAddress: 'delivery.partyLabels.deliveryAddress',
  thana: 'delivery.partyLabels.thana',
  district: 'delivery.partyLabels.district',
  receiverMobile: 'delivery.partyLabels.receiverMobile',
} as const satisfies Record<string, TranslationKey>

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

/**
 * "3 challans" — a counted noun.
 *
 * Both forms are passed in rather than derived from a trailing `s`: the caller
 * is the only thing that knows which noun it means, and a language that does
 * not pluralise simply hands over the same string twice.
 */
export function plural(count: number, one: string, many: string): string {
  return `${formatNumber(count)} ${count === 1 ? one : many}`
}
