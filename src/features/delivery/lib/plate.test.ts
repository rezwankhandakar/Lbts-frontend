import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { highlightPlate, plateKey } from './plate.ts'

describe('plateKey', () => {
  it('matches the server key for every way of writing a plate', () => {
    assert.equal(plateKey('Dhaka Metro-TA 11-1234'), 'DHAKAMETROTA111234')
    assert.equal(plateKey('১২৩৪'), '1234')
  })
})

describe('highlightPlate', () => {
  it('lights up the digits that were typed, where they sit on the plate', () => {
    assert.deepEqual(highlightPlate('DHAKA METRO-TA-11-1234', '1234'), [
      { text: 'DHAKA METRO-TA-11-', match: false },
      { text: '1234', match: true },
    ])
  })

  it('carries the match across the punctuation the operator skipped', () => {
    assert.deepEqual(highlightPlate('DHAKA METRO-TA-11-1234', 'ta111234'), [
      { text: 'DHAKA METRO-', match: false },
      { text: 'TA-11-1234', match: true },
    ])
  })

  it('prefers the tail when the digits appear twice', () => {
    const segments = highlightPlate('DHAKA METRO-TA-11-2311', '11')
    assert.deepEqual(segments.at(-1), { text: '11', match: true })
  })

  it('finds Bangla digits from an ASCII query', () => {
    assert.deepEqual(highlightPlate('ঢাকা মেট্রো-ট ১১-১২৩৪', '1234').at(-1), {
      text: '১২৩৪',
      match: true,
    })
  })

  it('returns the plate untouched when it does not match', () => {
    assert.deepEqual(highlightPlate('DHAKA METRO-GA-99-8765', '1234'), [
      { text: 'DHAKA METRO-GA-99-8765', match: false },
    ])
  })
})
