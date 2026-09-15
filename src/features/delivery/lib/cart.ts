/**
 * The Delivery cart, as pure transitions.
 *
 * Everything an operator does to the challans on a trip before confirming it —
 * add one, split it, trim a quantity, stand a different model in, add a line
 * the paper did not list, correct who receives it — is a function from one
 * cart to the next here, tested without a renderer in the same spirit as
 * `challan-session.ts`. The component tree only renders what these return.
 *
 * Import-free on purpose: `node --test` loads this file directly and knows
 * nothing about the `@/` alias. The types other files need are declared here
 * and re-exported from `../types`, which is the direction CLAUDE.md sets — the
 * alias-free file owns the value.
 *
 * The cart lives in the browser until Confirm, exactly as a challan session
 * does. A trip does not exist before it is numbered, and a server-side draft
 * would be a record created because a page was opened.
 */

// --- Shapes ----------------------------------------------------------------

/**
 * A trip's status, declared here so this file needs no import.
 *
 * Two states and neither is a button: a trip is `Open` until every challan on
 * it has been signed for, and `Completed` after. Mirrors `TRIP_STATUSES` in
 * `delivery.constants.ts`, where the reasoning is written out.
 */
export type TripStatus = 'Open' | 'Completed'

/** What one challan's delivery amounts to. Mirrors `DELIVERY_OUTCOMES`. */
export type DeliveryOutcome = 'Pending' | 'Complete'

/** What was hired for the last few metres. Mirrors `CARRYING_KINDS`. */
export type CarryingKind = 'Vehicle' | 'Labour'

/** One challan line with where it stands across every other trip. */
export interface LineAllocation {
  index: number
  productName: string
  model: string
  ordered: number
  dispatched: number
  remaining: number
}

export interface CandidateTripRef {
  id: string
  tripNumber: string
  status: TripStatus
  registrationNo: string
}

export interface ChallanLocation {
  district: string
  thana: string
  locationType: string
}

/** A challan as the server offers it to the cart. Mirrors `ChallanCandidate`. */
export interface ChallanCandidate {
  id: string
  challanNumber: string
  slNumber: number
  customerName: string
  deliveryAddress: string
  thana: string
  district: string
  location: ChallanLocation | null
  receiverMobile: string
  submittedAt: string
  lines: LineAllocation[]
  ordered: number
  dispatched: number
  remaining: number
  trips: CandidateTripRef[]
}

/** The delivery details a trip may correct without touching the challan. */
export interface CartParty {
  customerName: string
  deliveryAddress: string
  thana: string
  district: string
  receiverMobile: string
}

export const PARTY_FIELDS: readonly (keyof CartParty)[] = [
  'customerName',
  'deliveryAddress',
  'thana',
  'district',
  'receiverMobile',
]

export interface CartLine {
  /** Stable within the cart, so a row keeps its focus while quantities change. */
  key: string
  /** The challan line this draws on, or null for a line the paper never listed. */
  sourceIndex: number | null
  productName: string
  model: string
  qty: number
}

export interface CartChallan extends CartParty {
  challanId: string
  challanNumber: string
  slNumber: number
  /** What the challan printed. */
  original: CartParty
  location: ChallanLocation | null
  /** The challan's lines with live allocation — what "remaining" is measured on. */
  sources: LineAllocation[]
  otherTrips: CandidateTripRef[]
  note: string
  lines: CartLine[]
  /**
   * How much of each challan line (by its position) this trip deliberately
   * leaves for a later one — written by **Split** and by nothing else.
   *
   * It is the whole of what separates a split from a correction. Trimming a
   * quantity, removing a line, replacing a model or adding a product all say
   * "the challan was wrong, this is what exists", and confirming rewrites the
   * challan to match; a split says "the rest is coming on the next lorry", and
   * the challan keeps it.
   */
  reserved: Record<number, number>
}

export interface CartState {
  challans: CartChallan[]
  /** Feeds line keys. Never reused, so a removed row's key cannot come back. */
  seq: number
}

export const EMPTY_CART: CartState = { challans: [], seq: 0 }

/** What a trip did to one line, relative to the paper. Mirrors the server. */
export type LineChange =
  | 'as-ordered'
  | 'split'
  | 'reduced'
  | 'increased'
  | 'substituted'
  | 'added'

// --- Keys ------------------------------------------------------------------

/** Byte-identical to the server's `comparisonKey`. */
export function comparisonKey(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9ঀ-৿]/g, '')
}

function sameProduct(
  a: { productName: string; model: string },
  b: { productName: string; model: string },
): boolean {
  return (
    comparisonKey(a.productName) === comparisonKey(b.productName) &&
    comparisonKey(a.model) === comparisonKey(b.model)
  )
}

function nextKey(state: CartState, challanId: string): [string, CartState] {
  const seq = state.seq + 1
  return [`${challanId}:${seq}`, { ...state, seq }]
}

function mapChallan(
  state: CartState,
  challanId: string,
  update: (challan: CartChallan) => CartChallan,
): CartState {
  return {
    ...state,
    challans: state.challans.map((challan) =>
      challan.challanId === challanId ? update(challan) : challan,
    ),
  }
}

function wholeQty(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1
}

// --- Adding and removing challans ------------------------------------------

export function hasChallan(state: CartState, challanId: string): boolean {
  return state.challans.some((challan) => challan.challanId === challanId)
}

/**
 * Whether a challan has nothing left to send. Adding one anyway is allowed —
 * a re-delivery is a real thing — but the workspace asks first.
 */
export function isFullyDispatched(candidate: ChallanCandidate): boolean {
  return candidate.lines.length > 0 && candidate.remaining === 0
}

/**
 * Puts a challan on the trip with **what is still to go** on each line.
 *
 * That default is the whole of how a split works from the operator's side: the
 * first trip takes four refrigerators and trims them to two; the second trip
 * adds the same challan and is offered the remaining two without anybody doing
 * arithmetic. A line with nothing left is left off. A challan with nothing left
 * at all is added at its full order, because the operator has said they want
 * it and there is no smaller honest default.
 *
 * Adding a challan already on the cart changes nothing — the caller says so.
 */
export function addChallan(state: CartState, candidate: ChallanCandidate): CartState {
  if (hasChallan(state, candidate.id)) {
    return state
  }

  const full = isFullyDispatched(candidate)
  const picked = candidate.lines.filter((line) => full || line.remaining > 0)

  let next = state
  const lines: CartLine[] = picked.map((line) => {
    const [key, advanced] = nextKey(next, candidate.id)
    next = advanced
    return {
      key,
      sourceIndex: line.index,
      productName: line.productName,
      model: line.model,
      qty: full ? line.ordered : line.remaining,
    }
  })

  const party: CartParty = {
    customerName: candidate.customerName,
    deliveryAddress: candidate.deliveryAddress,
    thana: candidate.thana,
    district: candidate.district,
    receiverMobile: candidate.receiverMobile,
  }

  return {
    ...next,
    challans: [
      ...next.challans,
      {
        challanId: candidate.id,
        challanNumber: candidate.challanNumber,
        slNumber: candidate.slNumber,
        ...party,
        original: party,
        location: candidate.location,
        sources: candidate.lines,
        otherTrips: candidate.trips,
        note: '',
        lines,
        // Nothing is held back until somebody splits it: what is offered is
        // what is left to send, and sending less than that is a correction.
        reserved: {},
      },
    ],
  }
}

export function removeChallan(state: CartState, challanId: string): CartState {
  return { ...state, challans: state.challans.filter((challan) => challan.challanId !== challanId) }
}

/**
 * Refreshes each challan's live allocation without touching what the operator
 * put on the trip — used when an edit reloads, and after a confirmation is
 * refused, so "remaining" is today's figure rather than the one from when the
 * challan was added.
 */
export function refreshSources(state: CartState, candidates: ChallanCandidate[]): CartState {
  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]))

  return {
    ...state,
    challans: state.challans.map((challan) => {
      const fresh = byId.get(challan.challanId)
      return fresh ? { ...challan, sources: fresh.lines, otherTrips: fresh.trips } : challan
    }),
  }
}

// --- Lines -----------------------------------------------------------------

export function setLineQty(
  state: CartState,
  challanId: string,
  key: string,
  qty: number,
): CartState {
  return mapChallan(state, challanId, (challan) => ({
    ...challan,
    lines: challan.lines.map((line) => (line.key === key ? { ...line, qty: wholeQty(qty) } : line)),
  }))
}

/**
 * Changing what a line is. Keeping its source is what makes this a
 * *substitution* — a different model standing in for the one on the paper,
 * and still using up that line's quantity — rather than an unrelated addition.
 */
export function editLine(
  state: CartState,
  challanId: string,
  key: string,
  change: { productName: string; model: string; qty: number },
): CartState {
  return mapChallan(state, challanId, (challan) => ({
    ...challan,
    lines: challan.lines.map((line) =>
      line.key === key
        ? {
            ...line,
            productName: change.productName.trim(),
            model: change.model.trim(),
            qty: wholeQty(change.qty),
          }
        : line,
    ),
  }))
}

/**
 * Taking a line off this trip — which takes it off the **challan** too, because
 * a line nothing carries and nothing reserves is a product that does not
 * exist. To leave it for a later lorry, split it instead.
 *
 * The last line cannot go: a challan on a trip carrying nothing is not on the
 * trip, and removing the challan says that honestly. Any reservation against
 * the line goes with it — a removal is not a way of holding something back.
 */
export function removeLine(state: CartState, challanId: string, key: string): CartState {
  return mapChallan(state, challanId, (challan) => {
    if (challan.lines.length <= 1) {
      return challan
    }

    const dropped = challan.lines.find((line) => line.key === key)
    const reserved = { ...challan.reserved }
    if (dropped?.sourceIndex !== null && dropped?.sourceIndex !== undefined) {
      delete reserved[dropped.sourceIndex]
    }

    return { ...challan, lines: challan.lines.filter((line) => line.key !== key), reserved }
  })
}

/** A product the paper never listed — the physical load had it, so the trip does. */
export function addLine(
  state: CartState,
  challanId: string,
  line: { productName: string; model: string; qty: number },
): CartState {
  const [key, next] = nextKey(state, challanId)

  return mapChallan(next, challanId, (challan) => ({
    ...challan,
    lines: [
      ...challan.lines,
      {
        key,
        sourceIndex: null,
        productName: line.productName.trim(),
        model: line.model.trim(),
        qty: wholeQty(line.qty),
      },
    ],
  }))
}

/** The challan lines no line on this trip draws on — what "add back" offers. */
export function missingSources(challan: CartChallan): LineAllocation[] {
  const drawn = new Set(challan.lines.map((line) => line.sourceIndex))
  return challan.sources.filter((source) => !drawn.has(source.index))
}

/** Puts a challan line back, with what is still to go (or the full order). */
export function restoreSource(state: CartState, challanId: string, index: number): CartState {
  const challan = state.challans.find((entry) => entry.challanId === challanId)
  const source = challan?.sources.find((entry) => entry.index === index)
  if (!challan || !source) {
    return state
  }

  const [key, next] = nextKey(state, challanId)
  return mapChallan(next, challanId, (entry) => ({
    ...entry,
    lines: [
      ...entry.lines,
      {
        key,
        sourceIndex: index,
        productName: source.productName,
        model: source.model,
        qty: source.remaining > 0 ? source.remaining : source.ordered,
      },
    ],
  }))
}

/**
 * Splitting a challan: how many of each line this trip takes, by source.
 *
 * Applied to the lines that carry the paper's own product — a substitution or
 * an added line is the operator's own and is left alone. Zero takes the line
 * off this trip; what is not taken stays on the challan for the next trip,
 * which is offered it by `addChallan`. At least one line always remains: a
 * split that takes nothing is a challan that belongs on another trip, and the
 * caller says so rather than emptying the card.
 */
export function splitChallan(
  state: CartState,
  challanId: string,
  take: Record<number, number>,
): CartState {
  const challan = state.challans.find((entry) => entry.challanId === challanId)
  if (!challan) {
    return state
  }

  let next = state
  const lines: CartLine[] = []
  const handled = new Set<number>()

  for (const line of challan.lines) {
    const source = line.sourceIndex === null ? null : challan.sources.find((entry) => entry.index === line.sourceIndex)
    const own = source !== null && source !== undefined && sameProduct(line, source)

    if (!own || line.sourceIndex === null || !(line.sourceIndex in take)) {
      lines.push(line)
      continue
    }

    handled.add(line.sourceIndex)
    const qty = Math.floor(take[line.sourceIndex])
    if (qty > 0) {
      lines.push({ ...line, qty })
    }
  }

  // A line the split asks for that is not on the trip yet — it was taken off
  // earlier — comes back at the quantity asked for.
  for (const source of challan.sources) {
    const qty = Math.floor(take[source.index] ?? 0)
    if (handled.has(source.index) || qty <= 0) {
      continue
    }
    if (challan.lines.some((line) => line.sourceIndex === source.index)) {
      continue
    }
    const [key, advanced] = nextKey(next, challanId)
    next = advanced
    lines.push({
      key,
      sourceIndex: source.index,
      productName: source.productName,
      model: source.model,
      qty,
    })
  }

  if (lines.length === 0) {
    return state
  }

  /**
   * What the split leaves behind, recorded — the challan keeps it, and the
   * next trip is offered it. Everything the operator did *not* take and did
   * not leave here is a correction, so a line taken in full reserves nothing.
   */
  const reserved: Record<number, number> = {}
  for (const source of challan.sources) {
    const taken = Math.floor(take[source.index] ?? 0)
    const later = Math.max(0, source.ordered - source.dispatched - taken)
    if (source.index in take && later > 0) {
      reserved[source.index] = later
    }
  }

  return mapChallan(next, challanId, (entry) => ({ ...entry, lines, reserved }))
}

/** What each paper line currently has on this trip, for the split dialog to start from. */
export function takenBySource(challan: CartChallan): Record<number, number> {
  const taken: Record<number, number> = {}

  for (const source of challan.sources) {
    taken[source.index] = challan.lines
      .filter((line) => line.sourceIndex === source.index && sameProduct(line, source))
      .reduce((sum, line) => sum + line.qty, 0)
  }

  return taken
}

// --- Delivery details ------------------------------------------------------

export function updateParty(
  state: CartState,
  challanId: string,
  party: CartParty,
  note: string,
): CartState {
  return mapChallan(state, challanId, (challan) => ({
    ...challan,
    customerName: party.customerName.trim(),
    deliveryAddress: party.deliveryAddress.trim(),
    thana: party.thana.trim(),
    district: party.district.trim(),
    receiverMobile: party.receiverMobile.trim(),
    note: note.trim(),
  }))
}

/** The delivery fields whose trip value differs from what the challan printed. */
export function editedFields(challan: CartChallan): (keyof CartParty)[] {
  return PARTY_FIELDS.filter((field) => challan[field].trim() !== challan.original[field].trim())
}

// --- Reading the cart ------------------------------------------------------

export function lineChange(challan: CartChallan, line: CartLine): LineChange {
  if (line.sourceIndex === null) {
    return 'added'
  }

  const source = challan.sources.find((entry) => entry.index === line.sourceIndex)
  if (!source) {
    return 'added'
  }
  if (!sameProduct(line, source)) {
    return 'substituted'
  }
  if (line.qty < source.ordered) {
    // Fewer than ordered is two different things, and only the reservation
    // says which: the rest is coming later, or it was never there.
    return (challan.reserved[line.sourceIndex] ?? 0) > 0 ? 'split' : 'reduced'
  }
  return line.qty > source.ordered ? 'increased' : 'as-ordered'
}

export interface CartOverage {
  challanId: string
  challanNumber: string
  productName: string
  model: string
  ordered: number
  onOtherTrips: number
  onThisTrip: number
}

/**
 * Lines this trip would take past the paper, computed from the allocation the
 * server sent. A preview of the server's own check, never a substitute for it —
 * the server re-reads every trip at confirmation.
 */
export function overagesOf(challan: CartChallan): CartOverage[] {
  return challan.sources.flatMap((source) => {
    // By product, as the server counts it: a substitution is a different
    // product that replaces this line rather than more of it.
    const onThisTrip = challan.lines
      .filter((line) => sameProduct(line, source))
      .reduce((sum, line) => sum + line.qty, 0)

    return onThisTrip > 0 && source.dispatched + onThisTrip > source.ordered
      ? [
          {
            challanId: challan.challanId,
            challanNumber: challan.challanNumber,
            productName: source.productName,
            model: source.model,
            ordered: source.ordered,
            onOtherTrips: source.dispatched,
            onThisTrip,
          },
        ]
      : []
  })
}

export function challanQty(challan: CartChallan): number {
  return challan.lines.reduce((sum, line) => sum + line.qty, 0)
}

export interface CartSummary {
  challans: number
  lines: number
  qty: number
  /** Lines anywhere on the trip that differ from their challan. */
  changedLines: number
  /** Challans whose delivery details were corrected for this trip. */
  editedChallans: number
  /** Challans on the trip that leave something for a later trip. */
  splitChallans: number
  /** Challans whose own product lines confirming this trip would rewrite. */
  correctedChallans: number
  overages: CartOverage[]
}

export function summarize(state: CartState): CartSummary {
  let lines = 0
  let qty = 0
  let changedLines = 0
  let editedChallans = 0
  let splitChallans = 0
  let correctedChallans = 0
  const overages: CartOverage[] = []

  for (const challan of state.challans) {
    lines += challan.lines.length
    qty += challanQty(challan)
    changedLines += challan.lines.filter((line) => lineChange(challan, line) !== 'as-ordered').length
    if (editedFields(challan).length > 0) {
      editedChallans += 1
    }
    if (leftForLater(challan) > 0) {
      splitChallans += 1
    }
    if (challanChanges(challan).length > 0) {
      correctedChallans += 1
    }
    overages.push(...overagesOf(challan))
  }

  return {
    challans: state.challans.length,
    lines,
    qty,
    changedLines,
    editedChallans,
    splitChallans,
    correctedChallans,
    overages,
  }
}

/**
 * A trip number without the vendor code in front of it.
 *
 * The stored number is `V-0007-TRIP-0012` and it stays that way: the serial is
 * the vendor's own running count, so the code in front is the whole of what
 * makes the number unique across the collection, and a unique index depends on
 * it. What it is not is what anybody says out loud. At a gate it is "trip
 * twelve", the vendor's name is already on the row beside it, and four
 * characters of prefix on every screen is four characters of noise.
 *
 * So the prefix is dropped for reading and never for storing. Anything that
 * does not look like a vendor-prefixed number is returned untouched, which is
 * what keeps this from quietly mangling a number some future format produces.
 */
export function shortTripNumber(tripNumber: string): string {
  return tripNumber.replace(/^V-\d+-(?=TRIP-)/, '')
}

/** One product rolled up across every challan on the trip. */
export interface ProductTallyRow {
  productName: string
  /** The distinct models it went out as, in the order they were added. */
  models: string[]
  qty: number
}

export interface ProductTally {
  rows: ProductTallyRow[]
  /** Every piece on the trip — the same figure `summarize` reports as `qty`. */
  qty: number
  /** Distinct products, which is what "how many kinds are on the lorry" means. */
  products: number
}

/**
 * What is actually on the lorry, by product.
 *
 * Six refrigerators and two air conditioners is a sentence somebody can check
 * against a tailgate. "8 pieces across 5 lines" is a number they cannot, which
 * is why this replaced the count-of-challans-and-pieces tiles that used to sit
 * at the top of a trip: those answered how much paperwork there was, and the
 * question at a gate is what is on the lorry.
 *
 * So the rollup is by **product name** — not by line, and not by challan. The
 * same refrigerator on three challans is one row here, because nobody counts a
 * lorry one challan at a time. Names are grouped case- and space-insensitively
 * so one product recorded two ways does not become two rows, and the first
 * spelling seen is the one shown. Models are collected beside the name rather
 * than splitting it: two models of refrigerator are still refrigerators to
 * somebody counting them.
 *
 * Ordered by quantity, largest first, so the biggest part of the load reads
 * first; ties keep the order they arrived in, which is the challans' own.
 */
export function tallyProducts(
  lines: readonly { productName: string; model: string; qty: number }[],
): ProductTally {
  const rows = new Map<string, ProductTallyRow>()
  let qty = 0

  for (const line of lines) {
    const productName = line.productName.trim()
    const key = productName.toLowerCase().replace(/\s+/g, ' ')
    const row = rows.get(key) ?? { productName, models: [], qty: 0 }

    row.qty += line.qty

    const model = line.model.trim()
    if (model && !row.models.includes(model)) {
      row.models.push(model)
    }

    rows.set(key, row)
    qty += line.qty
  }

  const ordered = [...rows.values()].sort((a, b) => b.qty - a.qty)

  return { rows: ordered, qty, products: ordered.length }
}

/** Every product line on the cart, flattened, ready for `tallyProducts`. */
export function cartLines(state: CartState): CartLine[] {
  return state.challans.flatMap((challan) => challan.lines)
}

/**
 * Pieces this trip deliberately leaves on the challan for a later one.
 *
 * The reservations, and nothing else. What is simply not taken is not "left
 * for later" any more — it is a line the challan is about to lose.
 */
export function leftForLater(challan: CartChallan): number {
  return Object.values(challan.reserved).reduce((sum, qty) => sum + qty, 0)
}

/**
 * What confirming this trip would do to the challan itself.
 *
 * The client's preview of `rebuildChallanItems` on the server, which is the
 * authority: a challan ends up as what every trip carries plus what is
 * reserved, so anything trimmed, removed, replaced or added changes the paper.
 * It is shown before Confirm because rewriting the office's record is not
 * something to discover afterwards.
 */
export interface ChallanChange {
  kind: 'reduced' | 'increased' | 'removed' | 'added'
  productName: string
  model: string
  /** What the challan says now; zero for a product it does not carry. */
  from: number
  /** What it would say; zero for a line that goes. */
  to: number
}

export function challanChanges(challan: CartChallan): ChallanChange[] {
  const totals = new Map<string, { productName: string; model: string; qty: number }>()

  const add = (line: { productName: string; model: string }, qty: number) => {
    const key = `${comparisonKey(line.productName)}|${comparisonKey(line.model)}`
    const entry = totals.get(key)
    if (entry) {
      entry.qty += qty
      return
    }
    totals.set(key, { productName: line.productName, model: line.model, qty })
  }

  // What other trips already carry of each line, plus what this one holds back.
  for (const source of challan.sources) {
    add(source, source.dispatched + (challan.reserved[source.index] ?? 0))
  }
  for (const line of challan.lines) {
    add(line, line.qty)
  }

  const changes: ChallanChange[] = []
  const seen = new Set<string>()

  for (const source of challan.sources) {
    const key = `${comparisonKey(source.productName)}|${comparisonKey(source.model)}`
    seen.add(key)
    const to = totals.get(key)?.qty ?? 0

    if (to === source.ordered) {
      continue
    }
    changes.push({
      kind: to === 0 ? 'removed' : to < source.ordered ? 'reduced' : 'increased',
      productName: source.productName,
      model: source.model,
      from: source.ordered,
      to,
    })
  }

  for (const [key, entry] of totals) {
    if (!seen.has(key) && entry.qty > 0) {
      changes.push({
        kind: 'added',
        productName: entry.productName,
        model: entry.model,
        from: 0,
        to: entry.qty,
      })
    }
  }

  return changes
}

// --- To and from the server ------------------------------------------------

export interface TripChallanPayload extends CartParty {
  challanId: string
  note: string
  lines: { sourceIndex: number | null; productName: string; model: string; qty: number }[]
  /** Which challan lines are held back, and how much of each. */
  reserved: { sourceIndex: number; qty: number }[]
}

export function toPayload(state: CartState): TripChallanPayload[] {
  return state.challans.map((challan) => ({
    challanId: challan.challanId,
    customerName: challan.customerName,
    deliveryAddress: challan.deliveryAddress,
    thana: challan.thana,
    district: challan.district,
    receiverMobile: challan.receiverMobile,
    note: challan.note,
    lines: challan.lines.map((line) => ({
      sourceIndex: line.sourceIndex,
      productName: line.productName,
      model: line.model,
      qty: line.qty,
    })),
    /**
     * Only the line and the quantity: the server reads what that line *is* off
     * the challan, so nothing here can hold back a product the paper does not
     * carry.
     */
    reserved: Object.entries(challan.reserved)
      .map(([sourceIndex, qty]) => ({ sourceIndex: Number(sourceIndex), qty }))
      .filter((entry) => entry.qty > 0),
  }))
}

/** A challan as a saved trip carries it — the shape `fromTrip` rebuilds a cart from. */
export interface StoredTripChallan extends CartParty {
  challanId: string
  challanNumber: string
  slNumber: number
  original: CartParty
  location: ChallanLocation | null
  note: string
  lines: {
    sourceIndex: number | null
    source: { productName: string; model: string; qty: number } | null
    productName: string
    model: string
    qty: number
  }[]
  /** What this trip left on the challan for a later one. */
  reserved: { productName: string; model: string; qty: number }[]
}

/**
 * Rebuilds a cart from a saved trip, for editing it.
 *
 * The trip's own lines are kept exactly; the live allocation comes from
 * `candidates`, fetched with this trip excluded so its own quantities are not
 * counted as "gone out on another trip". A challan deleted since the trip was
 * made has no candidate, and falls back to the copy the trip took of it.
 */
export function fromTrip(
  challans: StoredTripChallan[],
  candidates: ChallanCandidate[],
): CartState {
  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]))
  let state: CartState = EMPTY_CART

  const built = challans.map((challan) => {
    const live = byId.get(challan.challanId)
    const sources: LineAllocation[] = live
      ? live.lines
      : challan.lines.flatMap((line) =>
          line.sourceIndex !== null && line.source
            ? [
                {
                  index: line.sourceIndex,
                  productName: line.source.productName,
                  model: line.source.model,
                  ordered: line.source.qty,
                  dispatched: 0,
                  remaining: line.source.qty,
                },
              ]
            : [],
        )

    const lines = challan.lines.map((line) => {
      const [key, next] = nextKey(state, challan.challanId)
      state = next
      return {
        key,
        sourceIndex: line.sourceIndex,
        productName: line.productName,
        model: line.model,
        qty: line.qty,
      }
    })

    /**
     * The reservations come back by product, because that is how the trip
     * stored them, and are matched onto the challan's lines as they stand now
     * — the position may have moved if the challan was corrected since.
     */
    const reserved: Record<number, number> = {}
    for (const entry of challan.reserved ?? []) {
      const source = sources.find(
        (line) =>
          comparisonKey(line.productName) === comparisonKey(entry.productName) &&
          comparisonKey(line.model) === comparisonKey(entry.model),
      )
      if (source) {
        reserved[source.index] = (reserved[source.index] ?? 0) + entry.qty
      }
    }

    return {
      challanId: challan.challanId,
      challanNumber: challan.challanNumber,
      slNumber: challan.slNumber,
      customerName: challan.customerName,
      deliveryAddress: challan.deliveryAddress,
      thana: challan.thana,
      district: challan.district,
      receiverMobile: challan.receiverMobile,
      original: challan.original,
      location: challan.location,
      sources,
      otherTrips: live?.trips ?? [],
      note: challan.note,
      lines,
      reserved,
    }
  })

  return { ...state, challans: built }
}
