import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  activeEntry,
  addEntry,
  checkEntryRange,
  clearSkipped,
  firstUnassignedPage,
  hasUnsavedWork,
  labelFor,
  markSubmitted,
  nextPendingAfter,
  progressOf,
  removeEntry,
  selectEntry,
  setRange,
  setValues,
  skipEntry,
  startSession,
} from './challan-session.ts'
import type { ChallanSession } from './challan-session.ts'

/**
 * The processing session.
 *
 * This is the state the business rules insist must not reach the database, so
 * it is also the state no server test can cover — which makes these the only
 * check that an operator working through a 24-page PDF ends up where they
 * expect after each submission.
 */

const VALUES = {
  customerName: 'ABC Electronics Ltd.',
  deliveryAddress: 'House 12, Road 4',
  thana: 'Mirpur',
  district: 'Dhaka',
  locationId: '',
  receiverMobile: '01712345678',
  senderMobile: '',
  zonePo: '',
  items: [{ productName: 'Refrigerator', model: 'WFA-2D4-GDEH-XX', qty: 2 }],
}

function filed(session: ChallanSession, id: string, n: number): ChallanSession {
  return markSubmitted(session, id, {
    id: `record-${n}`,
    challanNumber: `LBTS-CH-2026-${String(n).padStart(6, '0')}`,
    slNumber: 10_000 + n,
  })
}

describe('opening a source PDF', () => {
  it('starts with one challan on page 1 rather than an empty queue', () => {
    const session = startSession(24)

    assert.equal(session.entries.length, 1)
    assert.equal(session.entries[0].startPage, 1)
    assert.equal(session.entries[0].endPage, 1)
    assert.equal(session.activeId, session.entries[0].id)
    assert.equal(session.sourcePageCount, 24)
  })

  it('gives every entry its own idempotency key at creation, not at submit', () => {
    // A key made at submit time would be new on every click, and two clicks
    // would be two challans. This is what makes a retry safe.
    const session = addEntry(addEntry(startSession(24)))
    const keys = new Set(session.entries.map((entry) => entry.submissionKey))

    assert.equal(keys.size, 3)
    for (const key of keys) {
      assert.ok(key.length >= 8, `key ${key} is too short for the server to accept`)
    }
  })

  it('holds nothing that could reach a server before a submission', () => {
    const session = startSession(24)
    assert.equal(session.entries[0].challanId, null)
    assert.equal(session.entries[0].challanNumber, null)
    assert.equal(session.entries[0].slNumber, null)
    assert.equal(session.entries[0].values, null)
  })
})

describe('adding challans', () => {
  it('starts each new one on the first page nothing has taken', () => {
    let session = startSession(24)
    session = setRange(session, session.entries[0].id, { startPage: 1, endPage: 2 })

    session = addEntry(session)
    assert.equal(session.entries[1].startPage, 3)

    session = setRange(session, session.entries[1].id, { startPage: 3, endPage: 5 })
    session = addEntry(session)
    assert.equal(session.entries[2].startPage, 6)
  })

  it('makes the new challan the active one, because that is where typing goes', () => {
    const session = addEntry(startSession(24))
    assert.equal(session.activeId, session.entries[1].id)
    assert.equal(activeEntry(session)?.id, session.entries[1].id)
  })

  it('finds the gap in the middle, not just the end', () => {
    let session = startSession(12)
    session = setRange(session, session.entries[0].id, { startPage: 1, endPage: 2 })
    session = addEntry(session)
    session = setRange(session, session.entries[1].id, { startPage: 7, endPage: 9 })

    assert.equal(firstUnassignedPage(session), 3)
  })
})

describe('keeping what has been typed', () => {
  it('holds values per challan, so switching between them loses nothing', () => {
    let session = addEntry(startSession(24))
    const [first, second] = session.entries

    session = setValues(session, first.id, VALUES)
    session = setValues(session, second.id, { ...VALUES, customerName: 'Second Customer' })
    session = selectEntry(session, first.id)

    assert.equal(activeEntry(session)?.values?.customerName, 'ABC Electronics Ltd.')
    assert.equal(session.entries[1].values?.customerName, 'Second Customer')
  })

  it('warns only when there is something to lose', () => {
    let session = startSession(24)
    assert.equal(hasUnsavedWork(session), false)

    session = setValues(session, session.entries[0].id, VALUES)
    assert.equal(hasUnsavedWork(session), true)

    session = filed(session, session.entries[0].id, 1)
    // What was typed is on the server now; a reload costs nothing.
    assert.equal(hasUnsavedWork(session), false)
  })
})

describe('filing a challan', () => {
  it('records what it became and moves to the next page', () => {
    let session = startSession(6)
    session = setRange(session, session.entries[0].id, { startPage: 1, endPage: 2 })
    const first = session.entries[0].id

    session = filed(session, first, 1)

    assert.equal(session.entries[0].status, 'submitted')
    assert.equal(session.entries[0].challanNumber, 'LBTS-CH-2026-000001')
    assert.equal(session.entries[0].slNumber, 10_001)

    // Nothing else was pending, and pages 3-6 are still unclaimed, so the next
    // challan is already open on page 3.
    assert.equal(session.entries.length, 2)
    assert.equal(session.entries[1].startPage, 3)
    assert.equal(session.activeId, session.entries[1].id)
  })

  it('goes to a challan that was already queued rather than opening a new one', () => {
    let session = startSession(9)
    session = setRange(session, session.entries[0].id, { startPage: 1, endPage: 2 })
    session = addEntry(session)
    session = setRange(session, session.entries[1].id, { startPage: 3, endPage: 4 })

    session = filed(session, session.entries[0].id, 1)

    assert.equal(session.entries.length, 2)
    assert.equal(session.activeId, session.entries[1].id)
  })

  it('wraps back to a challan skipped earlier rather than stranding it', () => {
    let session = startSession(12)
    session = addEntry(session)
    session = addEntry(session)
    const [first, second, third] = session.entries.map((entry) => entry.id)

    session = setRange(session, first, { startPage: 1, endPage: 2 })
    session = setRange(session, second, { startPage: 3, endPage: 4 })
    session = setRange(session, third, { startPage: 5, endPage: 6 })

    // The operator skips the second and files the third.
    session = selectEntry(session, third)
    session = filed(session, third, 1)

    // Forward from the third wraps round to the first still pending.
    assert.equal(session.activeId, first)
    assert.equal(nextPendingAfter(session.entries, 2), first)
  })

  it('leaves nothing active once every page belongs to a filed challan', () => {
    let session = startSession(2)
    session = setRange(session, session.entries[0].id, { startPage: 1, endPage: 2 })
    session = filed(session, session.entries[0].id, 1)

    assert.equal(session.activeId, null)
    assert.equal(session.entries.length, 1)
    assert.equal(progressOf(session).isComplete, true)
  })
})

describe('session progress', () => {
  it('counts submitted pages, not ranges somebody has merely drawn', () => {
    let session = startSession(24)
    session = setRange(session, session.entries[0].id, { startPage: 1, endPage: 2 })
    session = addEntry(session)
    session = setRange(session, session.entries[1].id, { startPage: 3, endPage: 4 })

    // Two ranges drawn, nothing filed.
    let progress = progressOf(session)
    assert.equal(progress.submitted, 0)
    assert.equal(progress.assignedPages, 0)
    assert.equal(progress.isComplete, false)

    session = filed(session, session.entries[0].id, 1)
    progress = progressOf(session)
    assert.equal(progress.submitted, 1)
    assert.equal(progress.assignedPages, 2)
    assert.equal(progress.unassignedPages, 22)
    assert.equal(progress.percent, 8)
  })

  it('reports the gaps so an operator can find the challan they skipped', () => {
    let session = startSession(9)
    session = setRange(session, session.entries[0].id, { startPage: 1, endPage: 2 })
    session = filed(session, session.entries[0].id, 1)
    session = setRange(session, session.activeId as string, { startPage: 6, endPage: 9 })
    session = filed(session, session.activeId as string, 2)

    const progress = progressOf(session)
    assert.deepEqual(progress.unassigned, [{ startPage: 3, endPage: 5 }])
    assert.equal(progress.isComplete, false)
  })

  it('is never complete for a source PDF with no pages', () => {
    assert.equal(progressOf(startSession(0)).isComplete, false)
  })
})

describe('removing a challan from the queue', () => {
  it('drops one that has not been filed', () => {
    let session = addEntry(startSession(24))
    const second = session.entries[1].id

    session = removeEntry(session, second)
    assert.equal(session.entries.length, 1)
  })

  it('refuses to drop one that is already a permanent record', () => {
    let session = startSession(24)
    session = filed(session, session.entries[0].id, 1)

    // Removing it here would only hide it; it exists on the server, and
    // deleting it is an API call rather than a change to a queue.
    const after = removeEntry(session, session.entries[0].id)
    assert.equal(after.entries.length, session.entries.length)
    assert.equal(after.entries[0].status, 'submitted')
  })

  it('moves focus off an entry it removed', () => {
    let session = addEntry(startSession(24))
    const active = session.activeId as string

    session = removeEntry(session, active)
    assert.notEqual(session.activeId, active)
    assert.ok(session.activeId)
  })
})

describe('checking a range inside the session', () => {
  it('refuses one that collides with another challan in the queue', () => {
    let session = startSession(24)
    session = setRange(session, session.entries[0].id, { startPage: 1, endPage: 4 })
    session = addEntry(session)
    session = setRange(session, session.entries[1].id, { startPage: 3, endPage: 6 })

    const problem = checkEntryRange(session, session.entries[1].id)
    assert.equal(problem?.code, 'overlap')
  })

  it('accepts one that only touches the gap', () => {
    let session = startSession(24)
    session = setRange(session, session.entries[0].id, { startPage: 1, endPage: 2 })
    session = addEntry(session)
    session = setRange(session, session.entries[1].id, { startPage: 3, endPage: 6 })

    assert.equal(checkEntryRange(session, session.entries[1].id), null)
  })

  it('also refuses one the server says is already filed from this PDF', () => {
    const session = startSession(24)

    const problem = checkEntryRange(session, session.entries[0].id, [
      { startPage: 1, endPage: 3, challanNumber: 'LBTS-CH-2026-000099' },
    ])

    assert.equal(problem?.code, 'overlap')
    assert.match(problem?.message ?? '', /LBTS-CH-2026-000099/)
  })

  it('does not count a challan filed in this session twice over', () => {
    let session = startSession(9)
    session = setRange(session, session.entries[0].id, { startPage: 1, endPage: 2 })
    session = filed(session, session.entries[0].id, 1)

    const active = session.activeId as string
    session = setRange(session, active, { startPage: 3, endPage: 4 })

    // The server also knows about pages 1-2, under the same challan number.
    const problem = checkEntryRange(session, active, [
      { startPage: 1, endPage: 2, challanNumber: 'LBTS-CH-2026-000001' },
    ])

    assert.equal(problem, null)
  })
})

describe('a page that is not a challan', () => {
  it('is accounted for without becoming a record', () => {
    let session = startSession(4)
    session = setRange(session, session.entries[0].id, { startPage: 1, endPage: 1 })

    session = skipEntry(session, session.entries[0].id)

    // No entry, no values, nothing that could ever be submitted — just a page
    // the operator has said is blank.
    assert.deepEqual(session.skippedPages, [1])
    assert.equal(
      session.entries.some((entry) => entry.startPage === 1),
      false,
    )
  })

  it('lets a batch finish that would otherwise be stuck forever', () => {
    let session = startSession(3)
    session = setRange(session, session.entries[0].id, { startPage: 1, endPage: 2 })
    session = filed(session, session.entries[0].id, 1)

    // Page 3 is a blank sheet. Without marking it the session could never be
    // complete, and only a complete batch can be printed as one document.
    assert.equal(progressOf(session).isComplete, false)

    session = skipEntry(session, session.activeId as string)

    const progress = progressOf(session)
    assert.equal(progress.isComplete, true)
    assert.equal(progress.unassignedPages, 0)
    assert.deepEqual(progress.unassigned, [])
  })

  it('opens the next challan rather than leaving an empty workspace', () => {
    let session = startSession(6)
    session = skipEntry(session, session.entries[0].id)

    // Page 1 was blank; the operator's next move is page 2, already waiting.
    assert.ok(session.activeId)
    assert.equal(activeEntry(session)?.startPage, 2)
  })

  it('marks every page of a multi-page range', () => {
    let session = startSession(9)
    session = setRange(session, session.entries[0].id, { startPage: 4, endPage: 6 })
    session = skipEntry(session, session.entries[0].id)

    assert.deepEqual(session.skippedPages, [4, 5, 6])
  })

  it('refuses to mark a challan that has already been filed', () => {
    let session = startSession(4)
    session = setRange(session, session.entries[0].id, { startPage: 1, endPage: 2 })
    session = filed(session, session.entries[0].id, 1)

    // Its pages are inside a filed challan; calling them blank would make the
    // batch count them twice.
    const after = skipEntry(session, session.entries[0].id)
    assert.deepEqual(after.skippedPages, [])
    assert.equal(after.entries[0].status, 'submitted')
  })

  it('can be undone, because it is a decision and not a deletion', () => {
    let session = startSession(4)
    session = skipEntry(session, session.entries[0].id)
    assert.equal(session.skippedPages.length, 1)

    session = clearSkipped(session)
    assert.deepEqual(session.skippedPages, [])
    assert.equal(progressOf(session).isComplete, false)
  })

  it('does not offer a marked page to the next challan', () => {
    let session = startSession(6)
    session = skipEntry(session, session.entries[0].id)
    session = setRange(session, session.activeId as string, { startPage: 2, endPage: 2 })

    // Page 1 is spoken for, so "add another" starts at 3 rather than 1.
    assert.equal(firstUnassignedPage(session), 3)
  })
})

describe('naming an entry before it has a number', () => {
  it('numbers it by its place in the queue', () => {
    const session = addEntry(addEntry(startSession(24)))
    assert.equal(labelFor(session, session.entries[0].id), 'Challan 01')
    assert.equal(labelFor(session, session.entries[2].id), 'Challan 03')
  })
})
