import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  MAX_SPLIT_PARTS,
  defaultLinkQty,
  evenParts,
  linkOutcome,
  splitProblem,
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
