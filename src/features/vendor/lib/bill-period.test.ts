import assert from 'node:assert/strict'
import { test } from 'node:test'
import { billPeriodOf, isSingleMonth } from './bill-period.ts'

const TODAY = '2026-10-18'

test('no dates is every month', () => {
  assert.deepEqual(billPeriodOf('', '', TODAY), { kind: 'all' })
  assert.equal(isSingleMonth(billPeriodOf('', '', TODAY)), false)
})

test('a range inside one month is that month', () => {
  const period = billPeriodOf('2026-10-01', '2026-10-31', TODAY)
  assert.deepEqual(period, {
    kind: 'months',
    first: { year: 2026, month: 10 },
    last: { year: 2026, month: 10 },
  })
  assert.equal(isSingleMonth(period), true)
})

test('a range across months names both ends, across a year too', () => {
  assert.deepEqual(billPeriodOf('2026-08-15', '2026-10-02', TODAY), {
    kind: 'months',
    first: { year: 2026, month: 8 },
    last: { year: 2026, month: 10 },
  })
  assert.deepEqual(billPeriodOf('2025-12-01', '2026-01-31', TODAY), {
    kind: 'months',
    first: { year: 2025, month: 12 },
    last: { year: 2026, month: 1 },
  })
})

test('an open end reaches as far as the other, the way the server adds it up', () => {
  // "From September" alone runs on to this month.
  assert.deepEqual(billPeriodOf('2026-09-10', '', TODAY), {
    kind: 'months',
    first: { year: 2026, month: 9 },
    last: { year: 2026, month: 10 },
  })
  // "Until August" alone is August.
  assert.equal(isSingleMonth(billPeriodOf('', '2026-08-20', TODAY)), true)
})

test('a range that runs backwards names the month it starts in', () => {
  const period = billPeriodOf('2026-10-05', '2026-08-01', TODAY)
  assert.equal(isSingleMonth(period), true)
  assert.deepEqual(period.kind === 'months' && period.first, { year: 2026, month: 10 })
})
