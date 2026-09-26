import assert from 'node:assert/strict'
import { test } from 'node:test'
import { attentionRows, attentionSummary } from './attention.ts'
import type { AttentionInput } from './attention.ts'

/**
 * The decisions worth pinning down, in the spirit CLAUDE.md sets: the
 * refusals matter more than the matches. What this file is really holding is
 * the difference between "nothing is outstanding" and "you cannot see it",
 * because those draw the same thing and only one of them may produce a
 * settled state.
 */

const QUIET: AttentionInput = {
  gatePass: { draft: 0, submitted: 0, rejected: 0 },
  challan: {
    batchesProcessing: 0,
    locationPending: 0,
    locationReview: 0,
    blankAmount: 0,
    partialAmount: 0,
    returnedAtDepot: 0,
  },
  delivery: { open: 0 },
  vendor: { expiredDocuments: 0, expiringDocuments: 0 },
  accounts: {
    vendorDue: 0,
    vendorDueBlankBills: 0,
    receivableOutstanding: 0,
    pendingFinalBills: 0,
    advancesOutstanding: 0,
  },
  users: { pending: 0 },
}

const ids = (input: AttentionInput): string[] => attentionRows(input).map((row) => row.id)

test('a zero draws no row at all', () => {
  assert.deepEqual(attentionRows(QUIET), [])
})

test('an empty input draws no row either', () => {
  // A role that reads nothing and an operation with nothing outstanding both
  // come to an empty list. The page tells them apart by whether anything was
  // asked for, not by what comes back here.
  assert.deepEqual(attentionRows({}), [])
})

test('a module the viewer cannot read contributes nothing', () => {
  const rows = attentionRows({ gatePass: { draft: 0, submitted: 3, rejected: 0 } })
  assert.deepEqual(
    rows.map((row) => row.id),
    ['gate-pass-submitted'],
  )
})

test('critical rows come before warnings, whatever the counts', () => {
  const rows = attentionRows({
    ...QUIET,
    // One sent-back gate pass against two hundred waiting for a check: the
    // small critical one still leads, because a big pile of ordinary work is
    // not an emergency and something quietly wrong is.
    gatePass: { draft: 0, submitted: 200, rejected: 1 },
  })

  assert.equal(rows[0]?.id, 'gate-pass-rejected')
  assert.equal(rows[0]?.severity, 'critical')
  assert.equal(rows[1]?.id, 'gate-pass-submitted')
})

test('a partly-charged challan outranks a blank one', () => {
  // The Product Rate rule: a partial covers three lines of four and reads as a
  // finished figure, so it is the dangerous one even when the blanks are more
  // numerous.
  const rows = attentionRows({
    ...QUIET,
    challan: { ...QUIET.challan!, partialAmount: 2, blankAmount: 40 },
  })

  assert.equal(rows[0]?.id, 'challan-partial-amount')
  assert.equal(rows[0]?.severity, 'critical')
  assert.equal(rows[1]?.id, 'challan-blank-amount')
})

test('within a severity the heavier row leads', () => {
  const rows = attentionRows({
    ...QUIET,
    challan: { ...QUIET.challan!, locationPending: 12, locationReview: 40 },
  })

  assert.deepEqual(
    rows.map((row) => row.id),
    ['challan-location-review', 'challan-location-pending'],
  )
})

test('every row carries a destination and an accessible name', () => {
  const rows = attentionRows({
    gatePass: { draft: 1, submitted: 1, rejected: 1 },
    challan: {
      batchesProcessing: 1,
      locationPending: 1,
      locationReview: 1,
      blankAmount: 1,
      partialAmount: 1,
      returnedAtDepot: 1,
    },
    delivery: { open: 1 },
    vendor: { expiredDocuments: 1, expiringDocuments: 1 },
    accounts: {
      vendorDue: 1,
      vendorDueBlankBills: 1,
      receivableOutstanding: 1,
      pendingFinalBills: 1,
      advancesOutstanding: 1,
    },
    users: { pending: 1 },
  })

  // Every backlog this module knows about, all at once: three gate pass,
  // six challan, one delivery, two vendor, one account queue and five money.
  assert.equal(rows.length, 18)

  for (const row of rows) {
    assert.ok(row.to.startsWith('/'), `${row.id} has no destination`)
    assert.ok(row.actionKey.length > 0, `${row.id} has no link name`)

    /*
     * Every row's wording is keyed on its own id, so this holds the one thing
     * that could silently go wrong once the sentences left this file: a row
     * pointing at a branch of the tree nobody wrote. The dictionary proves the
     * key resolves; this proves the row asks for its own.
     */
    assert.equal(row.titleKey, `dashboard.attention.rows.${row.id}.title`)
    assert.equal(row.detailKey, `dashboard.attention.rows.${row.id}.detail`)

    // A row states exactly one figure, and it is a raw number so the message
    // can pluralise on it and the formatter can shape its digits.
    const figures = [row.count, row.taka].filter((value) => value !== undefined)
    assert.equal(figures.length, 1, `${row.id} states ${figures.length} figures`)

    /**
     * The destination is a plain path and the filter rides beside it in router
     * state. A query string here would be read by nothing — no list in this
     * app takes its filters from the URL — so the row would land on the whole
     * collection while claiming to have counted a backlog.
     */
    assert.ok(!row.to.includes('?'), `${row.id} puts a filter in the URL`)
  }

  // Ids are what React keys on, so two rows sharing one would silently drop
  // a backlog off the page.
  assert.equal(new Set(rows.map((row) => row.id)).size, rows.length)
})

test('a row that narrows a list carries the seed that narrows it', () => {
  const rows = attentionRows({
    gatePass: { draft: 0, submitted: 4, rejected: 0 },
    challan: {
      batchesProcessing: 0,
      locationPending: 3,
      locationReview: 0,
      blankAmount: 0,
      partialAmount: 0,
      returnedAtDepot: 0,
    },
  })

  const byId = new Map(rows.map((row) => [row.id, row]))

  /**
   * Gate Pass filters status through its **column** dropdowns rather than a
   * toolbar select — its records page is a sheet — so the seed is a set of
   * ticked values. `seedState` in the component is what holds this shape to
   * `GatePassListParams` at compile time; this pins the value itself.
   */
  assert.deepEqual(byId.get('gate-pass-submitted')?.seed, {
    key: 'gatePassFilters',
    value: { columns: { status: ['Submitted'] } },
  })
  assert.deepEqual(byId.get('challan-location-pending')?.seed, {
    key: 'challanFilters',
    value: { location: 'pending' },
  })
})

test('a row that opens a whole page carries no seed', () => {
  // The unfinished source PDFs are the batches page itself, which has nothing
  // to narrow — a seed there would name a filter that does not exist.
  const rows = attentionRows({
    challan: {
      batchesProcessing: 2,
      locationPending: 0,
      locationReview: 0,
      blankAmount: 0,
      partialAmount: 0,
      returnedAtDepot: 0,
    },
  })

  assert.equal(rows[0]?.to, '/challan/batches')
  assert.equal(rows[0]?.seed, undefined)
})

test('a money row states an amount, not a record count', () => {
  const rows = attentionRows({
    accounts: {
      vendorDue: 125_400,
      vendorDueBlankBills: 0,
      receivableOutstanding: 0,
      pendingFinalBills: 0,
      advancesOutstanding: 0,
    },
  })

  assert.equal(rows.length, 1)
  // The amount travels as a number; `lib/i18n/format.ts` is what puts a ৳ in
  // front of it and decides whose digits it is written in.
  assert.equal(rows[0]?.taka, 125_400)
  assert.equal(rows[0]?.count, undefined)
})

test('a negative vendor due is not a backlog', () => {
  // Paid ahead. `vendorDueOf` can come out below zero when advances ran past
  // the bill, and "−৳2,000 owed to vendors" is not a job for anybody.
  assert.deepEqual(
    ids({
      accounts: {
        vendorDue: -2000,
        vendorDueBlankBills: 0,
        receivableOutstanding: 0,
        pendingFinalBills: 0,
        advancesOutstanding: 0,
      },
    }),
    [],
  )
})

test('the pending-account warning is drawn, closing its own known gap', () => {
  const rows = attentionRows({ users: { pending: 2 } })

  assert.equal(rows.length, 1)
  assert.equal(rows[0]?.id, 'users-pending')
  assert.equal(rows[0]?.to, '/administration')
  assert.deepEqual(rows[0]?.seed, { key: 'userFilters', value: { status: 'Pending' } })
})

test('the summary counts the two severities apart', () => {
  const rows = attentionRows({
    ...QUIET,
    gatePass: { draft: 2, submitted: 3, rejected: 1 },
    vendor: { expiredDocuments: 1, expiringDocuments: 0 },
  })

  assert.deepEqual(attentionSummary(rows), { total: 4, critical: 2, warning: 2 })
})

test('the summary of nothing is three zeroes', () => {
  assert.deepEqual(attentionSummary([]), { total: 0, critical: 0, warning: 0 })
})
