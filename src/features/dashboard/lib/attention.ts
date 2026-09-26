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
 *
 * A fourth rule arrived with the second language: **a row states which figure
 * it is about and never how that figure reads.** The wording lives in
 * `dashboard.attention.rows.<id>`, keyed by the row's own id, and the number
 * travels as a number so the message can pluralise on it and the formatter can
 * shape its digits. What used to be a `plural()` helper and a `toLocaleString`
 * with `en-IN` welded into it are both gone: an `s` on the end of a noun is a
 * fact about English, and pinned Latin digits are a fact about neither
 * language this app speaks.
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
  /**
   * The row's identity **and** where its wording lives: every row reads from
   * `dashboard.attention.rows.<id>`. One name rather than two is what stops a
   * row being added with a key nobody wrote, and the hyphens survive the move
   * because a message key is a string rather than an identifier.
   */
  id: string
  severity: AttentionSeverity
  icon: AttentionIcon
  /**
   * Keys rather than sentences, typed as plain `string` rather than
   * `TranslationKey` because this file stays import-free — the same compromise
   * `AttentionIcon` already makes by naming a Lucide icon instead of importing
   * one. The component casts, and the dictionary is what proves the key is
   * real.
   */
  titleKey: string
  detailKey: string
  /** What the link is called, for a reader hearing the row rather than seeing it. */
  actionKey: string
  /**
   * The figure the title states, left as a **number** on purpose.
   *
   * It does two jobs that pull in opposite directions: the plural has to be
   * chosen from the raw count, and the screen has to show ১২ rather than 12.
   * So the row carries the number and the component passes both — `count` for
   * the choice and `n` for the print. A row that interpolated a pre-formatted
   * string here could not be pluralised at all.
   */
  count?: number
  /** The same, for the rows that state an amount of money rather than a count. */
  taka?: number
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
  | {
      key: 'challanFilters'
      value: { dispatch: 'pending' | 'partial' | 'sent' | 'delivered' | 'returned' }
    }
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

/** Where a row's own wording lives. The id is the key. */
const ROW = 'dashboard.attention.rows.'

const GATE_PASS = 'dashboard.attention.actions.gatePass'
const CHALLAN = 'dashboard.attention.actions.challan'
const VENDORS = 'dashboard.attention.actions.vendors'

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
        count: rejected,
        titleKey: `${ROW}gate-pass-rejected.title`,
        detailKey: `${ROW}gate-pass-rejected.detail`,
        to: '/gate-pass',
        seed: { key: 'gatePassFilters', value: { columns: { status: ['Rejected'] } } },
        actionKey: GATE_PASS,
      })
    }

    if (submitted > 0) {
      rows.push({
        id: 'gate-pass-submitted',
        severity: 'warning',
        icon: 'clock',
        weight: submitted,
        count: submitted,
        titleKey: `${ROW}gate-pass-submitted.title`,
        detailKey: `${ROW}gate-pass-submitted.detail`,
        to: '/gate-pass',
        seed: { key: 'gatePassFilters', value: { columns: { status: ['Submitted'] } } },
        actionKey: GATE_PASS,
      })
    }

    if (draft > 0) {
      rows.push({
        id: 'gate-pass-draft',
        severity: 'warning',
        icon: 'file-clock',
        weight: draft,
        count: draft,
        titleKey: `${ROW}gate-pass-draft.title`,
        detailKey: `${ROW}gate-pass-draft.detail`,
        to: '/gate-pass',
        seed: { key: 'gatePassFilters', value: { columns: { status: ['Draft'] } } },
        actionKey: GATE_PASS,
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
        count: c.partialAmount,
        titleKey: `${ROW}challan-partial-amount.title`,
        detailKey: `${ROW}challan-partial-amount.detail`,
        to: '/challan',
        seed: { key: 'challanFilters', value: { amount: 'partial' } },
        actionKey: CHALLAN,
      })
    }

    if (c.blankAmount > 0) {
      rows.push({
        id: 'challan-blank-amount',
        severity: 'warning',
        icon: 'coins',
        weight: c.blankAmount,
        count: c.blankAmount,
        titleKey: `${ROW}challan-blank-amount.title`,
        detailKey: `${ROW}challan-blank-amount.detail`,
        to: '/challan',
        seed: { key: 'challanFilters', value: { amount: 'unpriced' } },
        actionKey: CHALLAN,
      })
    }

    if (c.batchesProcessing > 0) {
      rows.push({
        id: 'challan-batches',
        severity: 'warning',
        icon: 'layers',
        weight: c.batchesProcessing,
        count: c.batchesProcessing,
        titleKey: `${ROW}challan-batches.title`,
        detailKey: `${ROW}challan-batches.detail`,
        to: '/challan/batches',
        actionKey: 'dashboard.attention.actions.sourcePdfs',
      })
    }

    if (c.locationPending > 0) {
      rows.push({
        id: 'challan-location-pending',
        severity: 'warning',
        icon: 'map-pin',
        weight: c.locationPending,
        count: c.locationPending,
        titleKey: `${ROW}challan-location-pending.title`,
        detailKey: `${ROW}challan-location-pending.detail`,
        to: '/challan',
        seed: { key: 'challanFilters', value: { location: 'pending' } },
        actionKey: CHALLAN,
      })
    }

    if (c.locationReview > 0) {
      rows.push({
        id: 'challan-location-review',
        severity: 'warning',
        icon: 'scan-eye',
        weight: c.locationReview,
        count: c.locationReview,
        titleKey: `${ROW}challan-location-review.title`,
        detailKey: `${ROW}challan-location-review.detail`,
        to: '/challan',
        seed: { key: 'challanFilters', value: { location: 'review' } },
        actionKey: CHALLAN,
      })
    }

    if (c.returnedAtDepot > 0) {
      rows.push({
        id: 'challan-returned',
        severity: 'warning',
        icon: 'undo',
        weight: c.returnedAtDepot,
        count: c.returnedAtDepot,
        titleKey: `${ROW}challan-returned.title`,
        detailKey: `${ROW}challan-returned.detail`,
        to: '/challan',
        seed: { key: 'challanFilters', value: { dispatch: 'returned' } },
        actionKey: CHALLAN,
      })
    }
  }

  if (input.delivery && input.delivery.open > 0) {
    rows.push({
      id: 'delivery-open',
      severity: 'warning',
      icon: 'file-clock',
      weight: input.delivery.open,
      count: input.delivery.open,
      titleKey: `${ROW}delivery-open.title`,
      detailKey: `${ROW}delivery-open.detail`,
      to: '/delivery',
      seed: { key: 'tripFilters', value: { status: 'Open' } },
      actionKey: 'dashboard.attention.actions.delivery',
    })
  }

  if (input.vendor) {
    if (input.vendor.expiredDocuments > 0) {
      rows.push({
        id: 'vendor-expired',
        severity: 'critical',
        icon: 'triangle-alert',
        weight: input.vendor.expiredDocuments,
        count: input.vendor.expiredDocuments,
        titleKey: `${ROW}vendor-expired.title`,
        detailKey: `${ROW}vendor-expired.detail`,
        to: '/vendors',
        seed: { key: 'vendorFilters', value: { compliance: 'expired' } },
        actionKey: VENDORS,
      })
    }

    if (input.vendor.expiringDocuments > 0) {
      rows.push({
        id: 'vendor-expiring',
        severity: 'warning',
        icon: 'file-clock',
        weight: input.vendor.expiringDocuments,
        count: input.vendor.expiringDocuments,
        titleKey: `${ROW}vendor-expiring.title`,
        detailKey: `${ROW}vendor-expiring.detail`,
        to: '/vendors',
        seed: { key: 'vendorFilters', value: { compliance: 'expiring' } },
        actionKey: VENDORS,
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
      count: input.users.pending,
      titleKey: `${ROW}users-pending.title`,
      detailKey: `${ROW}users-pending.detail`,
      to: '/administration',
      seed: { key: 'userFilters', value: { status: 'Pending' } },
      actionKey: 'dashboard.attention.actions.administration',
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
        count: a.vendorDueBlankBills,
        titleKey: `${ROW}accounts-blank-bills.title`,
        detailKey: `${ROW}accounts-blank-bills.detail`,
        to: '/accounts/vendor-bills',
        actionKey: 'dashboard.attention.actions.vendorBills',
      })
    }

    if (a.vendorDue > 0) {
      rows.push({
        id: 'accounts-vendor-due',
        severity: 'warning',
        icon: 'receipt',
        weight: a.vendorDue,
        taka: a.vendorDue,
        titleKey: `${ROW}accounts-vendor-due.title`,
        detailKey: `${ROW}accounts-vendor-due.detail`,
        to: '/accounts/vendor-bills',
        actionKey: 'dashboard.attention.actions.vendorBills',
      })
    }

    if (a.receivableOutstanding > 0) {
      rows.push({
        id: 'accounts-receivable',
        severity: 'warning',
        icon: 'coins',
        weight: a.receivableOutstanding,
        taka: a.receivableOutstanding,
        titleKey: `${ROW}accounts-receivable.title`,
        detailKey: `${ROW}accounts-receivable.detail`,
        to: '/accounts/final-bills',
        actionKey: 'dashboard.attention.actions.finalBills',
      })
    }

    if (a.pendingFinalBills > 0) {
      rows.push({
        id: 'accounts-pending-final',
        severity: 'warning',
        icon: 'clock',
        weight: a.pendingFinalBills,
        count: a.pendingFinalBills,
        titleKey: `${ROW}accounts-pending-final.title`,
        detailKey: `${ROW}accounts-pending-final.detail`,
        to: '/accounts/final-bills',
        actionKey: 'dashboard.attention.actions.finalBills',
      })
    }

    if (a.advancesOutstanding > 0) {
      rows.push({
        id: 'accounts-advances',
        severity: 'warning',
        icon: 'coins',
        weight: a.advancesOutstanding,
        taka: a.advancesOutstanding,
        titleKey: `${ROW}accounts-advances.title`,
        detailKey: `${ROW}accounts-advances.detail`,
        to: '/accounts/advances',
        actionKey: 'dashboard.attention.actions.advances',
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
