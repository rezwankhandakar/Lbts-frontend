/**
 * What the operation has outstanding, as a list somebody can work down.
 *
 * **Pure and import-free**, so `node --test` can load it without the `@/`
 * alias — the rule `page-ranges.ts` and `paste-parse.ts` already follow. It
 * takes the figures the module `/stats` endpoints already return and decides
 * which of them are a job rather than a reading. Nothing here fetches, renders
 * or knows about React.
 *
 * Three rules decide the shape of every row, and all three are stated
 * elsewhere in this codebase for the same reasons:
 *
 * - **A row exists only when its count is above zero.** This is a to-do list,
 *   like the Challan backlog chips and the vendor overview's `ComplianceAlert`
 *   — not a status badge, where an absent figure would wrongly read as "no
 *   information". A panel that always has content is a panel people stop
 *   reading, so an operation with nothing outstanding gets the settled state
 *   rather than eleven rows saying everything is fine.
 * - **Every row is a link carrying the filter that answers it.** A count
 *   nobody can act on is a number to scroll past.
 * - **Nothing is invented.** Every figure is a real count from the same
 *   aggregation its own module's page reads, so a row here can never claim
 *   something the page it leads to would disagree with.
 */

/**
 * How much a row matters, and it is deliberately about **being quietly wrong**
 * rather than about volume.
 *
 * `critical` is for the things that look finished and are not: a challan
 * carrying a figure for some of its lines and none for the rest, a trip billed
 * for the lorry but not the labour, a document that has actually lapsed, a
 * gate pass a reviewer sent back. A big pile of ordinary work stays a
 * `warning` however big it gets — a hundred challans waiting for a location is
 * a busy week, not an emergency.
 */
export type AttentionSeverity = 'critical' | 'warning'

/**
 * The icon by name rather than by import, because this file stays import-free
 * so `node --test` can load it. The component maps these onto Lucide.
 */
export type AttentionIcon =
  | 'clock'
  | 'undo'
  | 'map-pin'
  | 'scan-eye'
  | 'coins'
  | 'triangle-alert'
  | 'file-clock'
  | 'user-plus'
  | 'receipt'
  | 'layers'

export interface AttentionRow {
  id: string
  severity: AttentionSeverity
  icon: AttentionIcon
  title: string
  detail: string
  /**
   * What the row is ranked by. A count of records for most rows and an amount
   * in taka for the money ones — it never reaches the screen, where the title
   * carries the figure in whichever unit is honest for it.
   */
  weight: number
  /** Where pressing it lands. A plain path — the filter travels beside it. */
  to: string
  /** The filter that answers the row. See `AttentionSeed`. */
  seed?: AttentionSeed
  /** What the link is called, for a reader hearing the row rather than seeing it. */
  action: string
}

/**
 * The filter that answers a row, handed to the destination as **router state**
 * rather than as a query string.
 *
 * That is the convention this app already keeps, and it is not a detail: list
 * filters have never lived in the URL here, and the one place they already
 * travel — coming back from a run of location edits — carries them in state for
 * the reason stated there, that it is a convenience for one journey rather than
 * a promise that a link reproduces a view. A `?status=Submitted` written here
 * would have been read by precisely nothing, and the row would have landed on
 * an unfiltered list while claiming to have counted twelve records — which is
 * the one failure an overview cannot afford.
 *
 * `key` is the state field the destination page reads; `value` is what it
 * merges over its own initial params, so **Clear** still clears to nothing.
 *
 * **The values are spelled out as literals, and that is the point.** This file
 * is import-free so `node --test` can load it, which means it cannot reach the
 * filter unions in each module's `types/index.ts` — so this is a deliberate
 * mirror, the same arrangement `DISPATCH_STATUSES` and every shared Zod shape
 * already use. `assertSeedsMatchFilters` in `dashboard-attention.tsx` is what
 * holds the mirror to the originals: it is a type-level check on the side that
 * *can* import them, so a value that no list would read stops the build instead
 * of quietly landing somebody on an unfiltered page. `amount: 'blank'` was
 * exactly that mistake — the real union says `'unpriced'`.
 */
export type AttentionSeed =
  /**
   * Gate Pass has no status select on its toolbar: the records page is a
   * sheet and status is one of its **column** dropdowns, so a seed here is a
   * set of ticked values rather than one word. Every other list still takes
   * a plain filter.
   */
  | {
      key: 'gatePassFilters'
      value: { columns: { status: ('Draft' | 'Submitted' | 'Verified' | 'Rejected')[] } }
    }
  | { key: 'challanFilters'; value: { amount: 'unpriced' | 'partial' } }
  | { key: 'challanFilters'; value: { location: 'pending' | 'review' } }
  | { key: 'challanFilters'; value: { dispatch: 'pending' | 'partial' | 'sent' | 'delivered' | 'returned' } }
  | { key: 'tripFilters'; value: { status: 'Open' | 'Completed' } }
  | { key: 'vendorFilters'; value: { compliance: 'expired' | 'expiring' | 'clear' } }
  | { key: 'userFilters'; value: { status: 'Pending' | 'Active' | 'Rejected' | 'Suspended' } }

/**
 * Everything the rows are built from.
 *
 * Every group is optional and a role that cannot read a module contributes
 * nothing rather than a zero — which is the difference between "there is
 * nothing outstanding here" and "you are not allowed to know". Both draw no
 * row; only one of them would be a lie if it drew a settled state.
 */
export interface AttentionInput {
  gatePass?: { draft: number; submitted: number; rejected: number }
  challan?: {
    batchesProcessing: number
    locationPending: number
    locationReview: number
    blankAmount: number
    partialAmount: number
    returnedAtDepot: number
  }
  delivery?: { open: number }
  vendor?: { expiredDocuments: number; expiringDocuments: number }
  accounts?: {
    vendorDue: number
    vendorDueBlankBills: number
    receivableOutstanding: number
    pendingFinalBills: number
    advancesOutstanding: number
  }
  users?: { pending: number }
}

/** `৳12,345`, in the Indian grouping the rest of the app formats money with. */
function taka(amount: number): string {
  return `৳${Math.round(amount).toLocaleString('en-IN')}`
}

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count.toLocaleString()} ${count === 1 ? one : many}`
}

const GATE_PASS = 'Open Gate Pass'
const CHALLAN = 'Open Challan'
const VENDORS = 'Open Vendors'

/**
 * The rows, most urgent first.
 *
 * Sorted by severity and then by weight, so the things that are quietly wrong
 * come before the largest pile of ordinary work. Ties keep the order they were
 * pushed in, which runs roughly in the order of the working day.
 */
export function attentionRows(input: AttentionInput): AttentionRow[] {
  const rows: AttentionRow[] = []

  if (input.gatePass) {
    const { draft, submitted, rejected } = input.gatePass

    if (rejected > 0) {
      rows.push({
        id: 'gate-pass-rejected',
        severity: 'critical',
        icon: 'undo',
        weight: rejected,
        title: `${plural(rejected, 'gate pass', 'gate passes')} sent back`,
        detail:
          'A reviewer found something wrong and returned these. Each one is corrected and resent — until then it carries a verdict nobody has answered.',
        to: '/gate-pass',
        seed: { key: 'gatePassFilters', value: { columns: { status: ['Rejected'] } } },
        action: GATE_PASS,
      })
    }

    if (submitted > 0) {
      rows.push({
        id: 'gate-pass-submitted',
        severity: 'warning',
        icon: 'clock',
        weight: submitted,
        title: `${plural(submitted, 'gate pass', 'gate passes')} awaiting a check`,
        detail:
          'Filed with their scan and waiting to be verified against it. A verification says these values match this paper.',
        to: '/gate-pass',
        seed: { key: 'gatePassFilters', value: { columns: { status: ['Submitted'] } } },
        action: GATE_PASS,
      })
    }

    if (draft > 0) {
      rows.push({
        id: 'gate-pass-draft',
        severity: 'warning',
        icon: 'file-clock',
        weight: draft,
        title: `${plural(draft, 'gate pass', 'gate passes')} still a draft`,
        detail:
          'Started and never submitted. A draft is in no report and no count, so it is work that has not landed anywhere yet.',
        to: '/gate-pass',
        seed: { key: 'gatePassFilters', value: { columns: { status: ['Draft'] } } },
        action: GATE_PASS,
      })
    }
  }

  if (input.challan) {
    const c = input.challan

    /**
     * The dangerous one, and why it outranks a blank. A blank amount is
     * visibly a blank; a partial covers three lines of four and reads as a
     * finished figure somebody would put in a report.
     */
    if (c.partialAmount > 0) {
      rows.push({
        id: 'challan-partial-amount',
        severity: 'critical',
        icon: 'coins',
        weight: c.partialAmount,
        title: `${plural(c.partialAmount, 'challan')} only partly charged`,
        detail:
          'Some lines carry a rate and some do not, so the amount looks complete and is not. Usually a product the rate card does not name yet.',
        to: '/challan',
        seed: { key: 'challanFilters', value: { amount: 'partial' } },
        action: CHALLAN,
      })
    }

    if (c.blankAmount > 0) {
      rows.push({
        id: 'challan-blank-amount',
        severity: 'warning',
        icon: 'coins',
        weight: c.blankAmount,
        title: `${plural(c.blankAmount, 'challan')} with no amount`,
        detail:
          'Nothing on the rate card answered these lines, or the challan has no location yet and the card has no column to read.',
        to: '/challan',
        seed: { key: 'challanFilters', value: { amount: 'unpriced' } },
        action: CHALLAN,
      })
    }

    if (c.batchesProcessing > 0) {
      rows.push({
        id: 'challan-batches',
        severity: 'warning',
        icon: 'layers',
        weight: c.batchesProcessing,
        title: `${plural(c.batchesProcessing, 'source PDF')} unfinished`,
        detail:
          'Pages in these files belong to no challan and are not marked blank. A batch cannot be downloaded or printed until every page is accounted for.',
        to: '/challan/batches',
        action: 'Open source PDFs',
      })
    }

    if (c.locationPending > 0) {
      rows.push({
        id: 'challan-location-pending',
        severity: 'warning',
        icon: 'map-pin',
        weight: c.locationPending,
        title: `${plural(c.locationPending, 'challan')} without a location`,
        detail:
          'Nothing could be determined from the thana, the district or the address. A blank beats a wrong one — these are settled by hand, two clicks each.',
        to: '/challan',
        seed: { key: 'challanFilters', value: { location: 'pending' } },
        action: CHALLAN,
      })
    }

    if (c.locationReview > 0) {
      rows.push({
        id: 'challan-location-review',
        severity: 'warning',
        icon: 'scan-eye',
        weight: c.locationReview,
        title: `${plural(c.locationReview, 'location')} nobody has confirmed`,
        detail:
          'A spelling normalised, a near-enough row picked, or a shortlist chosen from. A wrong district on a filed challan is invisible to everything downstream.',
        to: '/challan',
        seed: { key: 'challanFilters', value: { location: 'review' } },
        action: CHALLAN,
      })
    }

    if (c.returnedAtDepot > 0) {
      rows.push({
        id: 'challan-returned',
        severity: 'warning',
        icon: 'undo',
        weight: c.returnedAtDepot,
        title: `${plural(c.returnedAtDepot, 'challan')} back at the depot`,
        detail:
          'Goods went out, came back off a trip and have not gone out again. These still read Pending, because they are still waiting for a lorry.',
        to: '/challan',
        seed: { key: 'challanFilters', value: { dispatch: 'returned' } },
        action: CHALLAN,
      })
    }
  }

  if (input.delivery && input.delivery.open > 0) {
    rows.push({
      id: 'delivery-open',
      severity: 'warning',
      icon: 'file-clock',
      weight: input.delivery.open,
      title: `${plural(input.delivery.open, 'trip')} awaiting a signed copy`,
      detail:
        'A trip closes when every receiver’s signed challan is scanned back in, or the copy is declared lost. Scanning one is a single barcode read.',
      to: '/delivery',
      seed: { key: 'tripFilters', value: { status: 'Open' } },
      action: 'Open Delivery',
    })
  }

  if (input.vendor) {
    if (input.vendor.expiredDocuments > 0) {
      rows.push({
        id: 'vendor-expired',
        severity: 'critical',
        icon: 'triangle-alert',
        weight: input.vendor.expiredDocuments,
        title: `${plural(input.vendor.expiredDocuments, 'vendor document')} expired`,
        detail:
          'A lorry or a driver whose papers have lapsed should not go out. File the renewed certificate against the vehicle or the driver.',
        to: '/vendors',
        seed: { key: 'vendorFilters', value: { compliance: 'expired' } },
        action: VENDORS,
      })
    }

    if (input.vendor.expiringDocuments > 0) {
      rows.push({
        id: 'vendor-expiring',
        severity: 'warning',
        icon: 'file-clock',
        weight: input.vendor.expiringDocuments,
        title: `${plural(input.vendor.expiringDocuments, 'vendor document')} expiring soon`,
        detail:
          'Inside thirty days of the expiry date. Renew before it passes and the vehicle or driver stops being assignable.',
        to: '/vendors',
        seed: { key: 'vendorFilters', value: { compliance: 'expiring' } },
        action: VENDORS,
      })
    }
  }

  /**
   * The gap CLAUDE.md names outright: "Nothing warns an Admin that a pending
   * queue is waiting; the count is only visible on the Administration page
   * itself." Somebody who signed up is locked out of everything until an Admin
   * approves them, and until now nothing told the Admin.
   */
  if (input.users && input.users.pending > 0) {
    rows.push({
      id: 'users-pending',
      severity: 'warning',
      icon: 'user-plus',
      weight: input.users.pending,
      title: `${plural(input.users.pending, 'account')} waiting for approval`,
      detail:
        'A new account is created with the least privilege and no access at all until it is approved. Whoever signed up cannot do anything yet.',
      to: '/administration',
      seed: { key: 'userFilters', value: { status: 'Pending' } },
      action: 'Open Administration',
    })
  }

  if (input.accounts) {
    const a = input.accounts

    if (a.vendorDueBlankBills > 0) {
      rows.push({
        id: 'accounts-blank-bills',
        severity: 'critical',
        icon: 'receipt',
        weight: a.vendorDueBlankBills,
        title: `${plural(a.vendorDueBlankBills, 'trip')} without a full bill`,
        detail:
          'Rent or labour has not been entered, so the vendor’s month reads lower than what is actually owed. It is the one way a month looks paid when it is not.',
        to: '/accounts/vendor-bills',
        action: 'Open Vendor Bills',
      })
    }

    if (a.vendorDue > 0) {
      rows.push({
        id: 'accounts-vendor-due',
        severity: 'warning',
        icon: 'receipt',
        weight: a.vendorDue,
        title: `${taka(a.vendorDue)} owed to vendors`,
        detail:
          'Trip rent and labour billed, less advances and payments. Each month settles on its own — the Vendor Bills page shows them apart.',
        to: '/accounts/vendor-bills',
        action: 'Open Vendor Bills',
      })
    }

    if (a.receivableOutstanding > 0) {
      rows.push({
        id: 'accounts-receivable',
        severity: 'warning',
        icon: 'coins',
        weight: a.receivableOutstanding,
        title: `${taka(a.receivableOutstanding)} to come in from Walton`,
        detail:
          'Final bills and labour bill CSDs together, less what has already been received against them.',
        to: '/accounts/final-bills',
        action: 'Open Final Bills',
      })
    }

    if (a.pendingFinalBills > 0) {
      rows.push({
        id: 'accounts-pending-final',
        severity: 'warning',
        icon: 'clock',
        weight: a.pendingFinalBills,
        title: `${plural(a.pendingFinalBills, 'bill')} waiting on an audit`,
        detail:
          'Submitted to Walton with no approved figure typed back in yet. A month without one is listed as pending and is not counted as income.',
        to: '/accounts/final-bills',
        action: 'Open Final Bills',
      })
    }

    if (a.advancesOutstanding > 0) {
      rows.push({
        id: 'accounts-advances',
        severity: 'warning',
        icon: 'coins',
        weight: a.advancesOutstanding,
        title: `${taka(a.advancesOutstanding)} out on advances`,
        detail:
          'Money handed out and not yet returned in cash. An advance is settled by cash coming back and by nothing else.',
        to: '/accounts/advances',
        action: 'Open Advances',
      })
    }
  }

  return sortRows(rows)
}

/**
 * Critical first, then the heaviest.
 *
 * `sort` is stable in every engine this runs on, so equal rows keep the order
 * they were pushed in — roughly the order of the working day, and a better
 * tie-break than anything arithmetic could offer.
 */
function sortRows(rows: AttentionRow[]): AttentionRow[] {
  const rank = (row: AttentionRow): number => (row.severity === 'critical' ? 0 : 1)
  return [...rows].sort((a, b) => rank(a) - rank(b) || b.weight - a.weight)
}

/** How many of each kind, for the line above the list. */
export function attentionSummary(rows: AttentionRow[]): {
  total: number
  critical: number
  warning: number
} {
  const critical = rows.filter((row) => row.severity === 'critical').length
  return { total: rows.length, critical, warning: rows.length - critical }
}
