import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  actorInitials,
  changeValueText,
  dayKeyOf,
  daysAgo,
  groupByDay,
} from './activity-grouping.ts'

/**
 * The journal's client-side decisions.
 *
 * Two of these matter more than they look. **Which day a row belongs to** is
 * computed in the viewer's own calendar rather than in UTC, and Dhaka is six
 * hours ahead — so an evening delivery is already tomorrow by the ISO string,
 * and grouping on it would file a third of every working day under the wrong
 * heading. And **an absent value against an empty one** is a distinction the
 * whole diff is built to preserve; a helper that collapsed the two would throw
 * it away at the last step, where nobody would look for it.
 */

describe('which day a row belongs to', () => {
  it('uses the viewer’s own calendar, not UTC', () => {
    // 8pm in Dhaka (UTC+6) on the 14th is already the 15th in UTC. The day a
    // person would file it under is the 14th.
    const dhakaEvening = new Date(2026, 8, 14, 20, 30).toISOString()
    assert.equal(dayKeyOf(dhakaEvening), '2026-09-14')
  })

  it('pads the month and the day so keys sort as text', () => {
    assert.equal(dayKeyOf(new Date(2026, 0, 3, 9, 0).toISOString()), '2026-01-03')
  })
})

describe('how many days ago something was', () => {
  const now = new Date(2026, 8, 23, 9, 0)

  it('counts calendar days rather than 24-hour blocks', () => {
    // 11pm yesterday is one day ago at 9am, not zero — a person counts days by
    // the date on them.
    assert.equal(daysAgo(new Date(2026, 8, 22, 23, 0).toISOString(), now), 1)
    assert.equal(daysAgo(new Date(2026, 8, 23, 0, 5).toISOString(), now), 0)
    assert.equal(daysAgo(new Date(2026, 8, 20, 12, 0).toISOString(), now), 3)
  })
})

describe('grouping the timeline by day', () => {
  const row = (year: number, month: number, day: number, hour: number) => ({
    id: `${year}-${month}-${day}-${hour}`,
    createdAt: new Date(year, month, day, hour).toISOString(),
  })

  it('gathers neighbours of the same day into one group', () => {
    const groups = groupByDay([
      row(2026, 8, 23, 16),
      row(2026, 8, 23, 9),
      row(2026, 8, 22, 18),
    ])

    assert.equal(groups.length, 2)
    assert.equal(groups[0]?.rows.length, 2)
    assert.equal(groups[1]?.rows.length, 1)
  })

  it('keeps the order it was given rather than sorting again', () => {
    const groups = groupByDay([row(2026, 8, 23, 16), row(2026, 8, 23, 9)])
    assert.deepEqual(
      groups[0]?.rows.map((entry) => entry.id),
      ['2026-8-23-16', '2026-8-23-9'],
    )
  })

  /**
   * A day split across a page boundary is correct rather than a bug: the
   * second page opens with the rest of that day under its own heading, which
   * is what a reader paging through a journal expects.
   */
  it('opens a new group when the same day reappears after another', () => {
    const groups = groupByDay([row(2026, 8, 23, 16), row(2026, 8, 22, 9), row(2026, 8, 23, 1)])
    assert.equal(groups.length, 3)
  })

  it('has nothing to group when there is nothing', () => {
    assert.deepEqual(groupByDay([]), [])
  })
})

describe('reading a recorded value', () => {
  it('tells a value that was never set from one that was cleared', () => {
    assert.equal(changeValueText(null), 'not set')
    assert.equal(changeValueText(''), 'blank')
  })

  it('leaves a real value alone', () => {
    assert.equal(changeValueText('Mirpur'), 'Mirpur')
    assert.equal(changeValueText('0'), '0')
  })
})

describe('initials for an actor', () => {
  it('takes the first and the last name, never a middle one', () => {
    assert.equal(actorInitials('Md Rezwan Khandaker'), 'MK')
    assert.equal(actorInitials('Rezwan'), 'R')
  })

  it('survives whatever a name turns out to be', () => {
    assert.equal(actorInitials('  spaced   out  '), 'SO')
    assert.equal(actorInitials(''), '?')
  })
})
