import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import { quickRangeFor, rangeFor } from './date-ranges.ts'

/**
 * The quick date ranges, pinned against a fixed clock.
 *
 * Worth testing for one reason: "last month" is the only range whose end is
 * not today, and the arithmetic that finds it — day zero of this month — is
 * exactly the kind that silently returns the 31st of a 30-day month or
 * December of the wrong year. A reconciliation run against a range that is one
 * day short is wrong in a way nobody notices until the totals disagree.
 */

/** Freezes the clock at a local wall-clock moment for one assertion. */
function at(year: number, month: number, day: number, run: () => void): void {
  mock.timers.enable({ apis: ['Date'], now: new Date(year, month - 1, day, 12, 0, 0) })
  try {
    run()
  } finally {
    mock.timers.reset()
  }
}

describe('quick date ranges', () => {
  it('makes today a single day', () => {
    at(2026, 9, 5, () => {
      assert.deepEqual(rangeFor('today'), { from: '2026-09-05', to: '2026-09-05' })
    })
  })

  it('runs this month from the first to today, not to the month end', () => {
    at(2026, 9, 5, () => {
      assert.deepEqual(rangeFor('month'), { from: '2026-09-01', to: '2026-09-05' })
    })
  })

  it('covers the whole of last month', () => {
    at(2026, 9, 5, () => {
      assert.deepEqual(rangeFor('lastMonth'), { from: '2026-08-01', to: '2026-08-31' })
    })
  })

  it('ends last month on its own last day, whatever its length', () => {
    at(2026, 5, 20, () => {
      // April has 30 days; a fixed 31 would ask for a day that does not exist.
      assert.deepEqual(rangeFor('lastMonth'), { from: '2026-04-01', to: '2026-04-30' })
    })

    at(2028, 3, 2, () => {
      // A leap February, which is the other length nobody hard-codes correctly.
      assert.deepEqual(rangeFor('lastMonth'), { from: '2028-02-01', to: '2028-02-29' })
    })
  })

  it('rolls back into the previous year in January', () => {
    at(2027, 1, 9, () => {
      assert.deepEqual(rangeFor('lastMonth'), { from: '2026-12-01', to: '2026-12-31' })
    })
  })

  it('recognises which chip a range belongs to', () => {
    at(2026, 9, 5, () => {
      assert.equal(quickRangeFor({ from: '', to: '' }), 'all')
      assert.equal(quickRangeFor(rangeFor('today')), 'today')
      assert.equal(quickRangeFor(rangeFor('month')), 'month')
      assert.equal(quickRangeFor(rangeFor('lastMonth')), 'lastMonth')
      assert.equal(quickRangeFor({ from: '2026-01-01', to: '2026-01-15' }), 'custom')
    })
  })
})
