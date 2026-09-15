import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { defaultLinkQty, evenParts, linkOutcome, splitProblem } from './split-parts.ts'

describe('dividing a Trip DO row', () => {
  it('divides a row as evenly as whole pieces allow, larger parts first', () => {
    assert.deepEqual(evenParts(5, 2), [3, 2])
    assert.deepEqual(evenParts(6, 3), [2, 2, 2])
    assert.deepEqual(evenParts(7, 3), [3, 2, 2])
  })

  it('never makes a part with nothing in it', () => {
    assert.deepEqual(evenParts(2, 5), [1, 1])
  })

  it('accepts parts that add up to the row and nothing else', () => {
    assert.equal(splitProblem([3, 2], 5), null)
    assert.match(splitProblem([3, 1], 5) ?? '', /1 still to place/)
    assert.match(splitProblem([3, 3], 5) ?? '', /1 too many/)
  })

  it('refuses a split of one part or a part of zero', () => {
    assert.match(splitProblem([5], 5) ?? '', /at least two/)
    assert.match(splitProblem([5, 0], 5) ?? '', /at least one piece/)
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
