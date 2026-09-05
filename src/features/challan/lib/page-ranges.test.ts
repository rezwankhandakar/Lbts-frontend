import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  MAX_CHALLAN_PAGES,
  assignedPageCount,
  batchProgress,
  checkRange,
  checkRangeAgainst,
  describeRange,
  findOverlaps,
  pageCountOf,
  rangesOverlap,
  unassignedRanges,
} from './page-ranges.ts'

/**
 * The browser half of the page-range rules.
 *
 * These are the same assertions the backend makes about the same algorithm, on
 * purpose: this file and `LBTS-Backend/src/modules/challan/lib/page-ranges.ts`
 * are a deliberate mirror, and a mirror that has quietly stopped matching is
 * worse than no mirror at all — the workspace would say a range is fine and
 * the submission would be refused, or the reverse.
 */

describe('what a range covers', () => {
  it('counts inclusively at both ends', () => {
    assert.equal(pageCountOf({ startPage: 1, endPage: 2 }), 2)
    assert.equal(pageCountOf({ startPage: 6, endPage: 6 }), 1)
    assert.equal(pageCountOf({ startPage: 7, endPage: 9 }), 3)
  })

  it('reads back the way somebody would say it aloud', () => {
    assert.equal(describeRange({ startPage: 6, endPage: 6 }), 'page 6')
    assert.equal(describeRange({ startPage: 3, endPage: 5 }), 'pages 3–5')
  })
})

describe('a range on its own', () => {
  it('accepts one inside the document', () => {
    assert.equal(checkRange({ startPage: 1, endPage: 2 }, 24), null)
    assert.equal(checkRange({ startPage: 24, endPage: 24 }, 24), null)
  })

  it('refuses one that runs backwards', () => {
    assert.equal(checkRange({ startPage: 5, endPage: 3 }, 24)?.code, 'reversed')
  })

  it('refuses a page before the first', () => {
    assert.equal(checkRange({ startPage: 0, endPage: 2 }, 24)?.code, 'not-a-page')
  })

  it('refuses one that runs past the last page', () => {
    assert.equal(checkRange({ startPage: 23, endPage: 25 }, 24)?.code, 'out-of-bounds')
  })

  it('refuses one too long to be a single challan', () => {
    assert.equal(
      checkRange({ startPage: 1, endPage: MAX_CHALLAN_PAGES + 1 }, 500)?.code,
      'too-many-pages',
    )
  })

  it('refuses a source PDF with no pages at all', () => {
    assert.equal(checkRange({ startPage: 1, endPage: 1 }, 0)?.code, 'out-of-bounds')
  })
})

describe('a range against what is already claimed', () => {
  const claimed = [
    { startPage: 1, endPage: 2, challanNumber: 'LBTS-CH-2026-000001' },
    { startPage: 3, endPage: 4, challanNumber: 'LBTS-CH-2026-000002' },
    { startPage: 7, endPage: 9, challanNumber: 'LBTS-CH-2026-000003' },
  ]

  it('knows a touch from a clean gap', () => {
    assert.equal(rangesOverlap({ startPage: 1, endPage: 2 }, { startPage: 2, endPage: 3 }), true)
    assert.equal(rangesOverlap({ startPage: 1, endPage: 2 }, { startPage: 3, endPage: 4 }), false)
    assert.equal(rangesOverlap({ startPage: 1, endPage: 9 }, { startPage: 4, endPage: 5 }), true)
  })

  it('lets a challan take the gap nobody claimed', () => {
    assert.equal(checkRangeAgainst({ startPage: 5, endPage: 6 }, 24, claimed), null)
  })

  it('names what already owns the pages it refuses', () => {
    const problem = checkRangeAgainst({ startPage: 4, endPage: 5 }, 24, claimed)
    assert.equal(problem?.code, 'overlap')
    assert.match(problem?.message ?? '', /LBTS-CH-2026-000002/)
  })

  it('lists every collision a wide selection makes, in page order', () => {
    assert.deepEqual(
      findOverlaps({ startPage: 1, endPage: 24 }, claimed).map((c) => c.challanNumber),
      ['LBTS-CH-2026-000001', 'LBTS-CH-2026-000002', 'LBTS-CH-2026-000003'],
    )
  })
})

describe('what is left of the source PDF', () => {
  it('finds nothing when the file is fully accounted for', () => {
    const claimed = [
      { startPage: 1, endPage: 2 },
      { startPage: 3, endPage: 6 },
    ]
    assert.deepEqual(unassignedRanges(claimed, 6), [])
    assert.equal(assignedPageCount(claimed, 6), 6)
  })

  it('collapses the gaps rather than listing loose pages', () => {
    assert.deepEqual(
      unassignedRanges([{ startPage: 1, endPage: 2 }, { startPage: 7, endPage: 9 }], 12),
      [
        { startPage: 3, endPage: 6 },
        { startPage: 10, endPage: 12 },
      ],
    )
  })

  it('reports the whole file when nothing has been filed', () => {
    assert.deepEqual(unassignedRanges([], 4), [{ startPage: 1, endPage: 4 }])
  })
})

describe('batch progress', () => {
  it('will not call a batch complete while pages are unaccounted for', () => {
    const progress = batchProgress([{ startPage: 1, endPage: 2 }], 24, 1)
    assert.equal(progress.isComplete, false)
    assert.equal(progress.unassignedPages, 22)
  })

  it('is complete exactly when every page belongs to a challan', () => {
    const progress = batchProgress([{ startPage: 1, endPage: 6 }], 6, 1)
    assert.equal(progress.isComplete, true)
    assert.equal(progress.percent, 100)
  })
})
