import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { draftFromEntry, emptyDraft, payloadFromDraft, requiresCashWallet, validateDraft } from './entry-draft.ts'

const TODAY = '2026-09-16'

describe('requiresCashWallet', () => {
  it('keeps every transaction to cash', () => {
    for (const kind of ['Deposit', 'Transfer', 'Expense', 'Advance', 'AdvanceReturn', 'TripAdvance', 'VendorPayment'] as const) {
      assert.equal(requiresCashWallet(kind, false), true)
    }
  })

  it('lets only a Walton payment against a final bill use a bank or mobile wallet', () => {
    assert.equal(requiresCashWallet('Deposit', true), false)
    assert.equal(requiresCashWallet('Expense', true), true)
  })
})

describe('emptyDraft', () => {
  it('dates a new entry today and puts a payment in the current month', () => {
    const draft = emptyDraft('VendorPayment', TODAY)
    assert.equal(draft.date, TODAY)
    assert.equal(draft.year, 2026)
    assert.equal(draft.month, 9)
    assert.equal(draft.amount, null)
  })

  it('keeps what the caller already knows', () => {
    const draft = emptyDraft('TripAdvance', TODAY, { tripId: 't1', amount: 2000 })
    assert.equal(draft.tripId, 't1')
    assert.equal(draft.amount, 2000)
  })
})

describe('validateDraft', () => {
  it('asks for an amount and a wallet on every kind that moves money', () => {
    const errors = validateDraft(emptyDraft('Expense', TODAY))
    assert.ok(errors.amount)
    assert.ok(errors.walletId)
    assert.ok(errors.expenseName)
  })

  it('never asks for a wallet when an advance is accepted as an expense', () => {
    const errors = validateDraft(emptyDraft('AdvanceAdjust', TODAY, { amount: 500, advanceId: 'a', expenseName: 'Fuel' }))
    assert.deepEqual(errors, {})
  })

  it('refuses a transfer into the wallet it leaves', () => {
    const errors = validateDraft(emptyDraft('Transfer', TODAY, { amount: 500, walletId: 'w', toWalletId: 'w' }))
    assert.ok(errors.toWalletId)
  })

  it('needs somebody to have received an advance', () => {
    const errors = validateDraft(emptyDraft('Advance', TODAY, { amount: 500, walletId: 'w', party: '   ' }))
    assert.ok(errors.party)
  })
})

describe('payloadFromDraft', () => {
  it('sends only the fields a kind accepts', () => {
    const payload = payloadFromDraft(
      emptyDraft('Expense', TODAY, { amount: 900, walletId: 'w', expenseName: ' Office rent ', tripId: 'stray', vendorId: 'stray' }),
    )
    assert.deepEqual(Object.keys(payload).sort(), ['amount', 'date', 'expenseName', 'kind', 'note', 'party', 'reference', 'walletId'])
    assert.equal(payload.expenseName, 'Office rent')
  })

  it('adds money into cash with nothing but the amount, the day and the wallet', () => {
    const payload = payloadFromDraft(emptyDraft('Deposit', TODAY, { amount: 900, walletId: 'w', party: 'stray' }))
    assert.deepEqual(Object.keys(payload).sort(), [
      'amount',
      'date',
      'finalBillId',
      'kind',
      'labourBillId',
      'labourCsd',
      'note',
      'reference',
      'walletId',
    ])
    assert.equal(payload.finalBillId, null)
    assert.equal(payload.labourBillId, null)
  })

  it('links a deposit recorded from a final bill to that bill', () => {
    const payload = payloadFromDraft(emptyDraft('Deposit', TODAY, { amount: 900, walletId: 'w', finalBillId: 'f' }))
    assert.equal(payload.finalBillId, 'f')
  })

  it('links a deposit recorded from a labour bill to that bill and its CSD', () => {
    const payload = payloadFromDraft(
      emptyDraft('Deposit', TODAY, { amount: 900, walletId: 'w', labourBillId: 'l', labourCsd: 'CSD-02' }),
    )
    assert.equal(payload.labourBillId, 'l')
    assert.equal(payload.labourCsd, 'CSD-02')
  })

  // A CSD without a bill names nothing, so it is dropped rather than sent as a
  // half link the server would have to refuse.
  it('drops a stray CSD when no labour bill is named', () => {
    const payload = payloadFromDraft(
      emptyDraft('Deposit', TODAY, { amount: 900, walletId: 'w', labourCsd: 'CSD-02' }),
    )
    assert.equal(payload.labourBillId, null)
    assert.equal(payload.labourCsd, '')
  })

  it('carries the month a vendor payment settles', () => {
    const payload = payloadFromDraft(
      emptyDraft('VendorPayment', TODAY, { amount: 900, walletId: 'w', vendorId: 'v', year: 2026, month: 8 }),
    )
    assert.equal(payload.month, 8)
    assert.equal(payload.vendorId, 'v')
  })
})

describe('draftFromEntry', () => {
  it('puts a saved trip advance back into the form it came from', () => {
    const draft = draftFromEntry({
      kind: 'TripAdvance',
      date: '2026-09-02',
      amount: 3000,
      wallet: { id: 'w' },
      toWallet: null,
      source: null,
      finalBill: null,
      labourBill: null,
      expenseName: '',
      party: 'Rahim',
      partyPhone: '',
      purpose: '',
      advance: null,
      trip: { id: 't' },
      vendor: { id: 'v' },
      period: null,
      reference: '',
      note: 'fuel',
    })
    assert.equal(draft.tripId, 't')
    assert.equal(draft.walletId, 'w')
    assert.equal(draft.amount, 3000)
    assert.deepEqual(validateDraft(draft), {})
  })
})
