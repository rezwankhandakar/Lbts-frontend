import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  EMPTY_BATCH,
  addItems,
  markFiled,
  newItem,
  nextPendingAfter,
  progressOf,
  removeItem,
  replaceWith,
  select,
  skipItem,
} from './batch-queue.ts'
import type { BatchItem, BatchState } from './batch-queue.ts'

/**
 * The stack of scanned sheets, tested without React.
 *
 * This is the part of the batch workflow that is easy to get subtly wrong —
 * which sheet comes next when one is skipped, whether a sheet skipped early is
 * ever reached again, when the stack counts as finished. All of it is a pure
 * function of the previous state, which is why it is worth pinning down.
 */

/** A File stand-in: nothing here reads a byte of it. */
function fakeFile(name: string): File {
  return { name, size: 1024, type: 'image/jpeg' } as unknown as File
}

/** A stack of `count` sheets with predictable ids: sheet-1, sheet-2, … */
function stackOf(count: number): BatchState {
  const items = Array.from({ length: count }, (_, index) =>
    newItem(fakeFile(`page-${index + 1}.jpg`), 1, `sheet-${index + 1}`),
  )
  return addItems(EMPTY_BATCH, items)
}

function statuses(state: BatchState): string[] {
  return state.items.map((item) => item.status)
}

const record = (gatePassId: string) => ({ id: `id-${gatePassId}`, gatePassId })

describe('adding sheets', () => {
  it('takes the first sheet as the one being worked on', () => {
    const state = stackOf(10)

    assert.equal(state.items.length, 10)
    assert.equal(state.activeId, 'sheet-1')
  })

  it('does not steal focus from a sheet already being typed', () => {
    const started = select(stackOf(3), 'sheet-2')
    const more = addItems(started, [newItem(fakeFile('extra.jpg'), 1, 'sheet-4')])

    assert.equal(more.activeId, 'sheet-2')
    assert.equal(more.items.length, 4)
  })

  it('ignores an empty scan rather than clearing the stack', () => {
    const state = stackOf(2)
    assert.deepEqual(addItems(state, []), state)
  })
})

describe('filing a sheet', () => {
  it('marks it, records what it became, and moves to the next', () => {
    const state = markFiled(stackOf(10), 'sheet-1', record('GP-2026-000001'), true)

    assert.equal(state.items[0].status, 'submitted')
    assert.equal(state.items[0].gatePassId, 'GP-2026-000001')
    assert.equal(state.items[0].recordId, 'id-GP-2026-000001')
    assert.equal(state.activeId, 'sheet-2')
  })

  it('tells a draft apart from a submission', () => {
    const state = markFiled(stackOf(2), 'sheet-1', record('GP-2026-000001'), false)
    assert.equal(state.items[0].status, 'draft')
  })

  it('works through a stack of ten, one sheet at a time', () => {
    let state = stackOf(10)

    for (let sheet = 1; sheet <= 10; sheet += 1) {
      assert.equal(state.activeId, `sheet-${sheet}`, `sheet ${sheet} should be active`)
      state = markFiled(state, `sheet-${sheet}`, record(`GP-${sheet}`), true)
    }

    assert.equal(state.activeId, null)
    assert.equal(progressOf(state.items).filed, 10)
    assert.equal(progressOf(state.items).isComplete, true)
  })

  it('leaves a sheet that is not in the stack alone', () => {
    const state = stackOf(2)
    assert.deepEqual(markFiled(state, 'sheet-99', record('GP-1'), true), state)
  })
})

describe('skipping', () => {
  it('moves past a skipped sheet without filing it', () => {
    const state = skipItem(stackOf(3), 'sheet-1')

    assert.deepEqual(statuses(state), ['skipped', 'pending', 'pending'])
    assert.equal(state.activeId, 'sheet-2')
    assert.equal(progressOf(state.items).filed, 0)
  })

  it('comes back to a sheet skipped earlier once the rest are done', () => {
    // Skip the second sheet, file the first and third, and the skipped one
    // must not be stranded behind the operator.
    let state = skipItem(stackOf(3), 'sheet-2')
    state = markFiled(state, 'sheet-1', record('GP-1'), true)
    state = markFiled(state, 'sheet-3', record('GP-3'), true)

    // Nothing pending is left, because a skip is a decision, not a deferral.
    assert.equal(state.activeId, null)
    assert.equal(progressOf(state.items).isComplete, true)
  })

  it('wraps to a pending sheet earlier in the stack', () => {
    // Jump to the last sheet and file it: the next one to work on is the
    // earliest still pending, not nothing.
    let state = select(stackOf(3), 'sheet-3')
    state = markFiled(state, 'sheet-3', record('GP-3'), true)

    assert.equal(state.activeId, 'sheet-1')
  })
})

describe('removing', () => {
  it('drops a sheet and selects another pending one', () => {
    const state = removeItem(stackOf(3), 'sheet-1')

    assert.equal(state.items.length, 2)
    assert.equal(state.activeId, 'sheet-2')
  })

  it('leaves the selection alone when a different sheet is removed', () => {
    const state = removeItem(select(stackOf(3), 'sheet-2'), 'sheet-3')
    assert.equal(state.activeId, 'sheet-2')
  })

  it('ends with nothing selected when the last sheet goes', () => {
    const state = removeItem(stackOf(1), 'sheet-1')

    assert.equal(state.items.length, 0)
    assert.equal(state.activeId, null)
  })
})

describe('combining a stack into one gate pass', () => {
  it('replaces every sheet with the single document', () => {
    const state = replaceWith(newItem(fakeFile('combined.pdf'), 3, 'combined'))

    assert.equal(state.items.length, 1)
    assert.equal(state.items[0].pageCount, 3)
    assert.equal(state.activeId, 'combined')
  })
})

describe('progress', () => {
  it('reports nothing to do for an empty stack', () => {
    const progress = progressOf([])

    assert.equal(progress.total, 0)
    assert.equal(progress.isComplete, false, 'an empty stack is not a finished one')
    assert.equal(progress.isBatch, false)
  })

  it('treats a single sheet as not a batch', () => {
    assert.equal(progressOf(stackOf(1).items).isBatch, false)
    assert.equal(progressOf(stackOf(2).items).isBatch, true)
  })

  it('counts drafts and submissions as filed, and skips as neither', () => {
    let state = stackOf(4)
    state = markFiled(state, 'sheet-1', record('GP-1'), true)
    state = markFiled(state, 'sheet-2', record('GP-2'), false)
    state = skipItem(state, 'sheet-3')

    const progress = progressOf(state.items)
    assert.equal(progress.filed, 2)
    assert.equal(progress.remaining, 1)
    assert.equal(progress.isComplete, false)
  })

  it('counts a stack of skips as finished, with nothing filed', () => {
    let state = stackOf(2)
    state = skipItem(state, 'sheet-1')
    state = skipItem(state, 'sheet-2')

    const progress = progressOf(state.items)
    assert.equal(progress.isComplete, true)
    assert.equal(progress.filed, 0)
  })
})

describe('nextPendingAfter', () => {
  it('returns null when nothing is pending', () => {
    const items: BatchItem[] = stackOf(2).items.map((item) => ({ ...item, status: 'submitted' }))
    assert.equal(nextPendingAfter(items, 0), null)
  })
})
