import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  cellText,
  groupLineIds,
  groupTotalsOf,
  isUnpricedLabourLine,
  labourBillYearOptions,
  lineTotal,
  parseCellInput,
  shortLabourBillNumber,
} from './labour-bill-math.ts'

describe('lineTotal', () => {
  it('adds the labour cell and the floor cell', () => {
    assert.equal(lineTotal(600, 250), 850)
  })

  it('treats a blank half as nothing once the other half is typed', () => {
    assert.equal(lineTotal(600, null), 600)
    assert.equal(lineTotal(null, 250), 250)
  })

  // The distinction the whole column rests on, and the reason this mirror of
  // the server's function exists rather than a `?? 0` at the call site.
  it('is null while neither cell has been typed, and zero once one says zero', () => {
    assert.equal(lineTotal(null, null), null)
    assert.equal(lineTotal(0, null), 0)
  })
})

describe('isUnpricedLabourLine', () => {
  it('counts only a row with both cells blank', () => {
    assert.equal(isUnpricedLabourLine({ labourAmount: null, floorAmount: null }), true)
    assert.equal(isUnpricedLabourLine({ labourAmount: 0, floorAmount: null }), false)
  })
})

describe('parseCellInput', () => {
  const MAX = 10_000_000

  it('reads a whole number', () => {
    assert.deepEqual(parseCellInput('600', MAX), { ok: true, value: 600 })
    assert.deepEqual(parseCellInput('  600 ', MAX), { ok: true, value: 600 })
    assert.deepEqual(parseCellInput('0', MAX), { ok: true, value: 0 })
  })

  // Clearing a cell is a correction, not a mistype: somebody who typed 600
  // against the wrong row has to be able to empty it without leaving a zero.
  it('reads an empty box as "not typed" rather than as zero', () => {
    assert.deepEqual(parseCellInput('', MAX), { ok: true, value: null })
    assert.deepEqual(parseCellInput('   ', MAX), { ok: true, value: null })
  })

  it('refuses anything that is not a whole non-negative number', () => {
    for (const raw of ['-5', '12.5', '1,200', 'abc', '৩০০', '1e3', '+5']) {
      assert.deepEqual(parseCellInput(raw, MAX), { ok: false }, raw)
    }
  })

  it('refuses a figure past the ceiling, which is what a mis-keyed row looks like', () => {
    assert.deepEqual(parseCellInput('10000001', MAX), { ok: false })
    assert.deepEqual(parseCellInput('200', 200), { ok: true, value: 200 })
    assert.deepEqual(parseCellInput('201', 200), { ok: false })
  })
})

describe('cellText', () => {
  it('shows an untyped cell as empty and a zero as zero', () => {
    assert.equal(cellText(null), '')
    assert.equal(cellText(undefined), '')
    assert.equal(cellText(0), '0')
    assert.equal(cellText(600), '600')
  })
})

describe('groupLineIds', () => {
  it('gives every row of a challan the same member list', () => {
    const lines = [
      { id: 'a', slRowSpan: 1 },
      { id: 'b', slRowSpan: 3 },
      { id: 'c', slRowSpan: 0 },
      { id: 'd', slRowSpan: 0 },
    ]
    const groups = groupLineIds(lines)

    assert.deepEqual(groups.get('a'), ['a'])
    assert.deepEqual(groups.get('b'), ['b', 'c', 'd'])
    assert.deepEqual(groups.get('d'), ['b', 'c', 'd'])
  })

  it('is empty for an empty sheet', () => {
    assert.equal(groupLineIds([]).size, 0)
  })
})

describe('groupTotalsOf', () => {
  const row = (
    challanId: string,
    qty: number,
    labourAmount: number | null,
    floorAmount: number | null,
  ) => ({ challanId, qty, labourAmount, floorAmount })

  it('adds up one CSD section and counts its challans once each', () => {
    const totals = groupTotalsOf([
      row('c1', 4, 800, 300),
      row('c2', 1, 500, 200),
      row('c2', 2, 500, null),
    ])

    assert.deepEqual(totals, {
      rows: 3,
      challans: 2,
      qty: 7,
      labourTotal: 1800,
      floorTotal: 500,
      totalAmount: 2300,
      unpricedLines: 0,
    })
  })

  // A row nobody has priced adds nothing and is counted instead, so a section
  // total that silently omits rows is never mistaken for a finished figure.
  it('counts a row with neither amount typed rather than adding it', () => {
    const totals = groupTotalsOf([row('c1', 1, null, null), row('c1', 1, 0, null)])
    assert.equal(totals.unpricedLines, 1)
    assert.equal(totals.totalAmount, 0)
  })

  it('is all zeroes for an empty section', () => {
    assert.deepEqual(groupTotalsOf([]), {
      rows: 0,
      challans: 0,
      qty: 0,
      labourTotal: 0,
      floorTotal: 0,
      totalAmount: 0,
      unpricedLines: 0,
    })
  })
})

describe('labourBillYearOptions', () => {
  it('offers two years back, this one and next, oldest first', () => {
    assert.deepEqual(labourBillYearOptions(2026, new Date('2026-09-19T00:00:00Z')), [
      2024, 2025, 2026, 2027,
    ])
  })

  it('keeps a bill whose year is outside that window', () => {
    assert.deepEqual(labourBillYearOptions(2021, new Date('2026-09-19T00:00:00Z')), [
      2021, 2024, 2025, 2026, 2027,
    ])
  })
})

describe('shortLabourBillNumber', () => {
  it('drops the prefix where the year is already on screen', () => {
    assert.equal(shortLabourBillNumber('LBTS-WLB-2026-0007'), 'WLB-0007')
  })

  it('leaves anything that is not one alone', () => {
    assert.equal(shortLabourBillNumber('LBTS-BILL-2026-0007'), 'LBTS-BILL-2026-0007')
  })
})
