import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  MAX_SPLIT_PARTS,
  bulkLinkPreview,
  bulkLinkShares,
  defaultLinkQty,
  evenParts,
  linkOutcome,
  splitProblem,
  withTickedRoom,
} from './split-parts.ts'

describe('dividing a Trip DO row', () => {
  it('divides a row as evenly as whole pieces allow, larger parts first', () => {
    assert.deepEqual(evenParts(5, 2), [3, 2])
    assert.deepEqual(evenParts(6, 3), [2, 2, 2])
    assert.deepEqual(evenParts(7, 3), [3, 2, 2])
  })

  it('never makes a part with nothing in it', () => {
    assert.deepEqual(evenParts(2, 5), [1, 1])
  })

  /*
   * A refusal is a key and the numbers that go in it, not a sentence — the
   * file is import-free and a sentence built here could only ever be English.
   * So these assert on the *decision*: which refusal, about which numbers.
   * That is also the half worth pinning, since the wording is the thing most
   * likely to be reworded.
   */
  it('accepts parts that add up to the row and nothing else', () => {
    assert.equal(splitProblem([3, 2], 5), null)

    assert.deepEqual(splitProblem([3, 1], 5), {
      key: 'tripDo.split.stillToPlace',
      values: { short: 1, sum: 4, total: 5 },
    })
    assert.deepEqual(splitProblem([3, 3], 5), {
      key: 'tripDo.split.tooMany',
      values: { over: 1, sum: 6, total: 5 },
    })
  })

  it('refuses a split of one part or a part of zero', () => {
    assert.deepEqual(splitProblem([5], 5), { key: 'tripDo.split.atLeastTwo' })
    assert.deepEqual(splitProblem([5, 0], 5), { key: 'tripDo.split.everyPart' })
  })

  it('refuses more parts than the row may be split into', () => {
    const tooMany = Array.from({ length: MAX_SPLIT_PARTS + 1 }, () => 1)

    assert.deepEqual(splitProblem(tooMany, tooMany.length), {
      key: 'tripDo.split.tooManyParts',
      values: { max: MAX_SPLIT_PARTS },
    })
  })

  it('offers the whole row when the gate pass has room, and what is left when it does not', () => {
    assert.equal(defaultLinkQty(5, 8), 5)
    assert.equal(defaultLinkQty(5, 3), 3)
    assert.equal(defaultLinkQty(5, 0), 0)
  })

  it('says what a link leaves behind on a row of its own', () => {
    assert.deepEqual(linkOutcome(5, 3), { linked: 3, remainder: 2 })
    assert.deepEqual(linkOutcome(5, 9), { linked: 5, remainder: 0 })
  })
})

describe('a bulk link of fewer pieces than were ticked', () => {
  const rows = [
    { sl: 10111, qty: 10 },
    { sl: 10112, qty: 10 },
    { sl: 10115, qty: 6 },
  ]

  it('fills the rows in order and splits the one the pieces run out on', () => {
    assert.deepEqual(bulkLinkShares([10, 10, 6], 25), [10, 10, 5])
    assert.deepEqual(bulkLinkShares([10, 10, 6], 26), [10, 10, 6])
    assert.deepEqual(bulkLinkShares([10, 10, 6], 12), [10, 2, 0])
  })

  it('names the row that is split and how much of it waits', () => {
    assert.deepEqual(bulkLinkPreview(rows, 25), {
      split: { part: rows[2], remainder: 1 },
      untouchedRows: 0,
    })
  })

  it('counts the rows the link never reaches, and splits nothing on an exact fill', () => {
    assert.deepEqual(bulkLinkPreview(rows, 10), { split: null, untouchedRows: 2 })
    assert.deepEqual(bulkLinkPreview(rows, 26), { split: null, untouchedRows: 0 })
  })
})

describe('the room a gate pass line has for ticked rows', () => {
  const option = {
    id: 'gp1',
    lineKey: 'WFA2A3GDELXX',
    qty: 25,
    allocatedQty: 10,
    remainingQty: 15,
    countsTowardQty: true,
  }

  it('gives back the pieces of other ticked rows already on that line', () => {
    const room = withTickedRoom(option, [{ gatePassId: 'gp1', lineKey: 'WFA2A3GDELXX', qty: 10 }])
    assert.equal(room.remainingQty, 25)
    assert.equal(room.allocatedQty, 0)
  })

  it('opens a line the ticked rows themselves fill', () => {
    const full = { ...option, allocatedQty: 25, remainingQty: 0 }
    assert.equal(withTickedRoom(full, [{ gatePassId: 'gp1', lineKey: 'WFA2A3GDELXX', qty: 4 }]).remainingQty, 4)
  })

  it('ignores ticked rows on another gate pass or another line', () => {
    const room = withTickedRoom(option, [
      { gatePassId: 'gp2', lineKey: 'WFA2A3GDELXX', qty: 10 },
      { gatePassId: 'gp1', lineKey: 'WFA2B4', qty: 4 },
    ])
    assert.equal(room, option)
  })

  it('leaves a return or re-sent row’s whole-line room alone', () => {
    const whole = { ...option, remainingQty: 25, countsTowardQty: false }
    assert.equal(withTickedRoom(whole, [{ gatePassId: 'gp1', lineKey: 'WFA2A3GDELXX', qty: 10 }]), whole)
  })
})
