import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  EMPTY_CART,
  addChallan,
  addLine,
  challanChanges,
  editLine,
  editedFields,
  fromTrip,
  leftForLater,
  lineChange,
  missingSources,
  overagesOf,
  refreshSources,
  removeChallan,
  removeLine,
  restoreSource,
  setLineQty,
  splitChallan,
  shortTripNumber,
  summarize,
  takenBySource,
  tallyProducts,
  toPayload,
  updateParty,
} from './cart.ts'
import type { CartState, ChallanCandidate } from './cart.ts'

/**
 * The Delivery cart, tested as decisions: what a challan is added with, what a
 * split leaves behind, what counts as a change, and what goes to the server.
 */

function candidate(overrides: Partial<ChallanCandidate> = {}): ChallanCandidate {
  return {
    id: 'ch1',
    challanNumber: 'LBTS-CH-2026-000982',
    slNumber: 10982,
    customerName: 'ABC Electronics',
    deliveryAddress: 'House 12, Road 3',
    thana: 'Mirpur',
    district: 'Dhaka',
    location: null,
    receiverMobile: '01712345678',
    submittedAt: '2026-09-10T08:00:00.000Z',
    lines: [
      { index: 0, productName: 'AC', model: 'WSN-24H', ordered: 2, dispatched: 0, remaining: 2 },
      {
        index: 1,
        productName: 'Refrigerator',
        model: 'WFN-1D5 GDEL',
        ordered: 4,
        dispatched: 0,
        remaining: 4,
      },
    ],
    ordered: 6,
    dispatched: 0,
    remaining: 6,
    trips: [],
    ...overrides,
  }
}

function withChallan(overrides: Partial<ChallanCandidate> = {}): CartState {
  return addChallan(EMPTY_CART, candidate(overrides))
}

const first = (state: CartState) => state.challans[0]

describe('addChallan', () => {
  it('puts every line on the trip at its full order when nothing has gone out', () => {
    assert.deepEqual(
      first(withChallan()).lines.map((line) => [line.sourceIndex, line.qty]),
      [
        [0, 2],
        [1, 4],
      ],
    )
  })

  it('offers only what is still to go when another trip took part of it', () => {
    const state = withChallan({
      lines: [
        { index: 0, productName: 'AC', model: 'WSN-24H', ordered: 2, dispatched: 2, remaining: 0 },
        { index: 1, productName: 'Refrigerator', model: 'WFN', ordered: 4, dispatched: 2, remaining: 2 },
      ],
      remaining: 2,
    })

    assert.deepEqual(
      first(state).lines.map((line) => [line.sourceIndex, line.qty]),
      [[1, 2]],
    )
  })

  it('adds a fully dispatched challan at its full order when asked to', () => {
    const state = withChallan({
      lines: [{ index: 0, productName: 'AC', model: 'X', ordered: 2, dispatched: 2, remaining: 0 }],
      remaining: 0,
    })

    assert.equal(first(state).lines[0].qty, 2)
  })

  it('adds a challan once', () => {
    const state = addChallan(withChallan(), candidate())
    assert.equal(state.challans.length, 1)
  })

  it('never reuses a line key', () => {
    const keys = first(addLine(withChallan(), 'ch1', { productName: 'A', model: 'B', qty: 1 })).lines.map(
      (line) => line.key,
    )
    assert.equal(new Set(keys).size, keys.length)
  })
})

describe('challanChanges', () => {
  it('says nothing about a challan carried as it was printed', () => {
    assert.deepEqual(challanChanges(first(withChallan())), [])
  })

  it('reports a trimmed quantity as a cut to the challan', () => {
    const state = withChallan()
    const trimmed = setLineQty(state, 'ch1', first(state).lines[1].key, 3)

    assert.deepEqual(challanChanges(first(trimmed)), [
      { kind: 'reduced', productName: 'Refrigerator', model: 'WFN-1D5 GDEL', from: 4, to: 3 },
    ])
  })

  it('says nothing about a split, because the challan keeps the rest', () => {
    assert.deepEqual(challanChanges(first(splitChallan(withChallan(), 'ch1', { 0: 2, 1: 2 }))), [])
  })

  it('reports a removed line as removed from the challan', () => {
    const state = withChallan()
    const removed = removeLine(state, 'ch1', first(state).lines[0].key)

    assert.deepEqual(challanChanges(first(removed)), [
      { kind: 'removed', productName: 'AC', model: 'WSN-24H', from: 2, to: 0 },
    ])
  })

  it('reports an added product, and a replacement as both', () => {
    const state = addLine(withChallan(), 'ch1', { productName: 'Stand', model: 'ST-1', qty: 1 })
    assert.deepEqual(challanChanges(first(state)), [
      { kind: 'added', productName: 'Stand', model: 'ST-1', from: 0, to: 1 },
    ])

    const swapped = editLine(state, 'ch1', first(state).lines[1].key, {
      productName: 'Refrigerator',
      model: 'WFN-2N5',
      qty: 4,
    })

    assert.deepEqual(
      challanChanges(first(swapped)).map((change) => [change.kind, change.model]),
      [
        ['removed', 'WFN-1D5 GDEL'],
        ['added', 'WFN-2N5'],
        ['added', 'ST-1'],
      ],
    )
  })

  it('drops a challan line no trip carries and nothing reserves', () => {
    // The operator took the line off the trip rather than splitting it, which
    // is the statement "this product is not there".
    const state = withChallan()
    const without = removeLine(state, 'ch1', first(state).lines[1].key)

    assert.deepEqual(
      challanChanges(first(without)).map((change) => [change.kind, change.from, change.to]),
      [['removed', 4, 0]],
    )
  })

  it('counts what other trips already carry before calling a line cut', () => {
    // Two went on the first lorry; this trip takes the other two. Nothing
    // about the challan changes.
    const state = withChallan({
      lines: [
        { index: 0, productName: 'AC', model: 'WSN-24H', ordered: 2, dispatched: 2, remaining: 0 },
        {
          index: 1,
          productName: 'Refrigerator',
          model: 'WFN-1D5 GDEL',
          ordered: 4,
          dispatched: 2,
          remaining: 2,
        },
      ],
      remaining: 2,
    })

    assert.deepEqual(challanChanges(first(state)), [])
  })
})

describe('lines', () => {
  it('keeps a quantity whole and at least one', () => {
    const state = withChallan()
    const key = first(state).lines[1].key

    assert.equal(first(setLineQty(state, 'ch1', key, 0)).lines[1].qty, 1)
    assert.equal(first(setLineQty(state, 'ch1', key, 2.7)).lines[1].qty, 2)
  })

  it('names what each edit does to a line', () => {
    let state = withChallan()
    const [ac, fridge] = first(state).lines

    assert.equal(lineChange(first(state), ac), 'as-ordered')

    state = setLineQty(state, 'ch1', fridge.key, 3)
    assert.equal(lineChange(first(state), first(state).lines[1]), 'reduced')

    state = setLineQty(state, 'ch1', fridge.key, 5)
    assert.equal(lineChange(first(state), first(state).lines[1]), 'increased')

    state = editLine(state, 'ch1', fridge.key, { productName: 'Refrigerator', model: 'WFN-2N5', qty: 4 })
    assert.equal(lineChange(first(state), first(state).lines[1]), 'substituted')

    state = addLine(state, 'ch1', { productName: 'Stand', model: 'ST-1', qty: 1 })
    assert.equal(lineChange(first(state), first(state).lines[2]), 'added')
  })

  it('reads the same model written differently as unchanged', () => {
    const state = withChallan()
    const key = first(state).lines[1].key
    const edited = editLine(state, 'ch1', key, { productName: 'refrigerator', model: 'wfn-1d5-gdel', qty: 4 })

    assert.equal(lineChange(first(edited), first(edited).lines[1]), 'as-ordered')
  })

  it('will not remove the last line of a challan', () => {
    let state = withChallan()
    state = removeLine(state, 'ch1', first(state).lines[0].key)
    state = removeLine(state, 'ch1', first(state).lines[0].key)

    assert.equal(first(state).lines.length, 1)
  })

  it('offers a removed paper line back, and restores it', () => {
    let state = withChallan()
    state = removeLine(state, 'ch1', first(state).lines[0].key)

    assert.deepEqual(missingSources(first(state)).map((source) => source.index), [0])

    state = restoreSource(state, 'ch1', 0)
    assert.deepEqual(missingSources(first(state)), [])
    assert.equal(first(state).lines.find((line) => line.sourceIndex === 0)?.qty, 2)
  })
})

describe('splitChallan', () => {
  it('takes part of each line and reserves the rest for a later trip', () => {
    const state = splitChallan(withChallan(), 'ch1', { 0: 1, 1: 2 })

    assert.deepEqual(takenBySource(first(state)), { 0: 1, 1: 2 })
    assert.deepEqual(first(state).reserved, { 0: 1, 1: 2 })
    assert.equal(leftForLater(first(state)), 3)
  })

  it('marks a split line as split rather than cut', () => {
    const state = splitChallan(withChallan(), 'ch1', { 0: 2, 1: 2 })
    const fridge = first(state).lines.find((line) => line.sourceIndex === 1)

    assert.equal(lineChange(first(state), fridge as NonNullable<typeof fridge>), 'split')
  })

  it('reserves nothing for a line taken in full', () => {
    const state = splitChallan(withChallan(), 'ch1', { 0: 2, 1: 4 })

    assert.deepEqual(first(state).reserved, {})
  })

  it('forgets the reservation when the line is removed afterwards', () => {
    // Removing says the product is not there at all, which is the opposite of
    // holding it back.
    let state = splitChallan(withChallan(), 'ch1', { 0: 1, 1: 2 })
    state = removeLine(state, 'ch1', first(state).lines[0].key)

    assert.equal(first(state).reserved[0], undefined)
    assert.equal(leftForLater(first(state)), 2)
  })

  it('takes a line off the trip at zero', () => {
    const state = splitChallan(withChallan(), 'ch1', { 0: 0, 1: 4 })
    assert.deepEqual(first(state).lines.map((line) => line.sourceIndex), [1])
  })

  it('refuses a split that would take nothing at all', () => {
    const state = withChallan()
    assert.equal(splitChallan(state, 'ch1', { 0: 0, 1: 0 }), state)
  })

  it('leaves a substituted line alone', () => {
    let state = withChallan()
    const fridge = first(state).lines[1].key
    state = editLine(state, 'ch1', fridge, { productName: 'Refrigerator', model: 'OTHER', qty: 4 })
    state = splitChallan(state, 'ch1', { 0: 1, 1: 1 })

    assert.equal(first(state).lines.find((line) => line.model === 'OTHER')?.qty, 4)
  })
})

describe('overagesOf', () => {
  it('flags a line this trip would send past the paper', () => {
    const state = withChallan({
      lines: [{ index: 0, productName: 'AC', model: 'X', ordered: 2, dispatched: 2, remaining: 0 }],
      remaining: 0,
    })

    assert.deepEqual(
      overagesOf(first(state)).map((overage) => [overage.onOtherTrips, overage.onThisTrip]),
      [[2, 2]],
    )
  })

  it('is quiet about an honest split', () => {
    assert.deepEqual(overagesOf(first(splitChallan(withChallan(), 'ch1', { 0: 2, 1: 2 }))), [])
  })
})

describe('delivery details', () => {
  it('marks what the trip corrected, and only that', () => {
    const state = updateParty(
      withChallan(),
      'ch1',
      {
        customerName: 'ABC Electronics',
        deliveryAddress: 'House 12, Road 3 (behind the mosque)',
        thana: 'Mirpur',
        district: 'Dhaka',
        receiverMobile: '01812345678',
      },
      'Call before arriving',
    )

    assert.deepEqual(editedFields(first(state)), ['deliveryAddress', 'receiverMobile'])
    assert.equal(first(state).note, 'Call before arriving')
    assert.equal(first(state).original.receiverMobile, '01712345678')
  })
})

describe('summarize', () => {
  it('adds up the trip', () => {
    let state = withChallan()
    state = addChallan(
      state,
      candidate({
        id: 'ch2',
        challanNumber: 'LBTS-CH-2026-000983',
        lines: [{ index: 0, productName: 'TV', model: 'WTV-43', ordered: 5, dispatched: 0, remaining: 5 }],
        remaining: 5,
      }),
    )
    state = setLineQty(state, 'ch1', first(state).lines[1].key, 2)

    const summary = summarize(state)
    assert.equal(summary.challans, 2)
    assert.equal(summary.qty, 2 + 2 + 5)
    assert.equal(summary.changedLines, 1)
    // Trimmed rather than split, so the challan is the thing that changes.
    assert.equal(summary.splitChallans, 0)
    assert.equal(summary.correctedChallans, 1)
  })

  it('counts a split as a split and not as a correction', () => {
    const summary = summarize(splitChallan(withChallan(), 'ch1', { 0: 2, 1: 2 }))

    assert.equal(summary.splitChallans, 1)
    assert.equal(summary.correctedChallans, 0)
  })

  it('forgets a challan that was removed', () => {
    assert.equal(summarize(removeChallan(withChallan(), 'ch1')).challans, 0)
  })
})

describe('toPayload', () => {
  it('sends what the trip carries and nothing the server decides', () => {
    const [payload] = toPayload(withChallan())

    assert.deepEqual(Object.keys(payload).sort(), [
      'challanId',
      'customerName',
      'deliveryAddress',
      'district',
      'lines',
      'note',
      'receiverMobile',
      'reserved',
      'thana',
    ])
    assert.deepEqual(Object.keys(payload.lines[0]).sort(), ['model', 'productName', 'qty', 'sourceIndex'])
  })

  it('sends a reservation as a line and a quantity, never as a product', () => {
    const [payload] = toPayload(splitChallan(withChallan(), 'ch1', { 0: 2, 1: 1 }))

    assert.deepEqual(payload.reserved, [{ sourceIndex: 1, qty: 3 }])
  })

  it('sends no reservation for a trimmed line', () => {
    const state = withChallan()
    const [payload] = toPayload(setLineQty(state, 'ch1', first(state).lines[1].key, 3))

    assert.deepEqual(payload.reserved, [])
  })
})

describe('fromTrip', () => {
  const stored = {
    challanId: 'ch1',
    challanNumber: 'LBTS-CH-2026-000982',
    slNumber: 10982,
    customerName: 'ABC Electronics',
    deliveryAddress: 'House 12',
    thana: '',
    district: '',
    receiverMobile: '01712345678',
    original: {
      customerName: 'ABC Electronics',
      deliveryAddress: 'House 12',
      thana: '',
      district: '',
      receiverMobile: '01712345678',
    },
    location: null,
    note: '',
    lines: [
      {
        sourceIndex: 1,
        source: { productName: 'Refrigerator', model: 'WFN-1D5 GDEL', qty: 4 },
        productName: 'Refrigerator',
        model: 'WFN-1D5 GDEL',
        qty: 2,
      },
    ],
    reserved: [{ productName: 'Refrigerator', model: 'WFN-1D5 GDEL', qty: 2 }],
  }

  it('keeps the trip lines and takes the live allocation', () => {
    const state = fromTrip([stored], [candidate()])

    assert.equal(first(state).lines[0].qty, 2)
    assert.equal(first(state).sources.length, 2)
  })

  it('puts a stored reservation back on the line it belongs to', () => {
    // Stored by product, matched onto the challan's lines as they stand now —
    // so a split survives an edit rather than becoming a cut on the second save.
    const state = fromTrip([stored], [candidate()])

    assert.deepEqual(first(state).reserved, { 1: 2 })

    // The refrigerator is whole again as 2 carried + 2 reserved; the air
    // conditioner this trip never carried is the only thing that would change.
    assert.deepEqual(
      challanChanges(first(state)).map((change) => [change.kind, change.model]),
      [['removed', 'WSN-24H']],
    )
  })

  it('falls back to the copy the trip took when the challan is gone', () => {
    const state = fromTrip([stored], [])

    assert.deepEqual(
      first(state).sources.map((source) => [source.index, source.ordered]),
      [[1, 4]],
    )
  })

  it('refreshes allocation without touching the lines', () => {
    const state = refreshSources(fromTrip([stored], []), [candidate()])

    assert.equal(first(state).sources.length, 2)
    assert.equal(first(state).lines[0].qty, 2)
  })
})

/**
 * What is on the lorry, by product.
 *
 * This is the summary that replaced the counts of challans, pieces and changed
 * lines at the top of a trip: an operator at a tailgate is counting
 * refrigerators, so the rollup has to be in the same units they are. Tested as
 * decisions because the grouping is where it can quietly go wrong — one
 * product recorded two ways becoming two rows is exactly the kind of thing
 * nobody notices until a count is short.
 */
describe('tallyProducts', () => {
  const lines = [
    { productName: 'Refrigerator', model: 'WFN-1D5', qty: 4 },
    { productName: 'Air Conditioner', model: 'WSN-24H', qty: 2 },
    { productName: 'Refrigerator', model: 'WFN-2N5', qty: 2 },
  ]

  it('rolls a product up across challans and lines', () => {
    const tally = tallyProducts(lines)

    assert.deepEqual(
      tally.rows.map((row) => [row.productName, row.qty]),
      [
        ['Refrigerator', 6],
        ['Air Conditioner', 2],
      ],
    )
  })

  it('reports the pieces and the kinds separately', () => {
    const tally = tallyProducts(lines)

    assert.equal(tally.qty, 8)
    assert.equal(tally.products, 2)
  })

  it('keeps every model the product went out as', () => {
    assert.deepEqual(tallyProducts(lines).rows[0].models, ['WFN-1D5', 'WFN-2N5'])
  })

  it('does not split one product recorded two ways into two rows', () => {
    // A count short by four because somebody typed a capital letter is the
    // failure this grouping exists to prevent.
    const tally = tallyProducts([
      { productName: 'Refrigerator', model: 'A', qty: 2 },
      { productName: 'refrigerator ', model: 'B', qty: 2 },
      { productName: 'Refrigerator  ', model: 'C', qty: 2 },
    ])

    assert.equal(tally.rows.length, 1)
    assert.equal(tally.rows[0].qty, 6)
  })

  it('shows the first spelling it saw', () => {
    const tally = tallyProducts([
      { productName: 'Refrigerator', model: 'A', qty: 1 },
      { productName: 'REFRIGERATOR', model: 'B', qty: 1 },
    ])

    assert.equal(tally.rows[0].productName, 'Refrigerator')
  })

  it('puts the biggest part of the load first', () => {
    const tally = tallyProducts([
      { productName: 'Kettle', model: 'K', qty: 1 },
      { productName: 'Refrigerator', model: 'R', qty: 9 },
    ])

    assert.deepEqual(tally.rows.map((row) => row.productName), ['Refrigerator', 'Kettle'])
  })

  it('leaves out a model nobody recorded rather than showing a blank', () => {
    const tally = tallyProducts([{ productName: 'Hair Dryer', model: '  ', qty: 3 }])

    assert.deepEqual(tally.rows[0].models, [])
  })

  it('has nothing to say about an empty lorry', () => {
    assert.deepEqual(tallyProducts([]), { rows: [], qty: 0, products: 0 })
  })
})

/**
 * The trip number as it is read rather than as it is stored.
 *
 * Storage keeps the vendor code, because the serial is the vendor's own count
 * and the code is the whole of what makes the number unique — a unique index
 * depends on it. These pin that the display half never touches anything it
 * does not recognise, which is what stops it mangling a number some later
 * format produces.
 */
describe('shortTripNumber', () => {
  it('drops the vendor code a reader does not need', () => {
    assert.equal(shortTripNumber('V-0007-TRIP-0012'), 'TRIP-0012')
  })

  it('handles a vendor code of any length', () => {
    assert.equal(shortTripNumber('V-12345-TRIP-0001'), 'TRIP-0001')
  })

  it('leaves a serial that has grown a digit alone', () => {
    assert.equal(shortTripNumber('V-0001-TRIP-12345'), 'TRIP-12345')
  })

  it('returns anything it does not recognise untouched', () => {
    assert.equal(shortTripNumber('TRIP-0012'), 'TRIP-0012')
    assert.equal(shortTripNumber('LBTS-CH-2026-000067'), 'LBTS-CH-2026-000067')
    assert.equal(shortTripNumber(''), '')
  })

  it('does not strip a prefix that is not a vendor code', () => {
    // V-0007 in the middle of something else is not this format.
    assert.equal(shortTripNumber('X-0007-TRIP-0012'), 'X-0007-TRIP-0012')
  })
})
