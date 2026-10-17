import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { backlogAfterBillSave } from './bill-backlog.ts'

describe('backlogAfterBillSave', () => {
  it('opens the no-rent backlog at its first page when the trip was not opened from the list', () => {
    assert.deepEqual(backlogAfterBillSave(null), { bill: 'no-rent', page: 1 })
  })

  it('keeps the page of a list already on the no-rent backlog, so the next trips slide onto it', () => {
    assert.deepEqual(backlogAfterBillSave({ page: 3, bill: 'no-rent' }), { bill: 'no-rent', page: 3 })
  })

  it('starts at page one when the list was on another filter, whose pages counted other trips', () => {
    assert.deepEqual(backlogAfterBillSave({ page: 4, bill: 'all' }), { bill: 'no-rent', page: 1 })
  })

  it('stays on the no-labour backlog, page and all, for somebody working that one', () => {
    assert.deepEqual(backlogAfterBillSave({ page: 2, bill: 'no-labour' }), { bill: 'no-labour', page: 2 })
  })
})
