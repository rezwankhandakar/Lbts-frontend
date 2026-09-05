import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  banglaHintFor,
  canOfferConversion,
  containsUnicodeBangla,
  forceBanglaConversion,
  isLikelyLegacyBangla,
  normalizeBanglaText,
  toUnicodeBangla,
} from './bangla-text.ts'

/**
 * The browser half of the Bijoy contract, mirroring the backend's tests.
 *
 * The guarantee being checked is not "the table is right" — that belongs to
 * the package. It is that this app never points a destructive converter at
 * text it should not touch: English, model codes, phone numbers and text that
 * is already Unicode Bangla have to survive untouched, because a value quietly
 * rewritten into Bangla letters is one nobody will ever recognise as wrong.
 */

describe('legacy Bijoy text', () => {
  const cases: [string, string][] = [
    ['evsjv‡`k', 'বাংলাদেশ'],
    ['†gvt Avwid †nv‡mb', 'মোঃ আরিফ হোসেন'],
    ['PÆMÖvg', 'চট্টগ্রাম'],
    ['Kg©KZ©vi', 'কর্মকর্তার'],
  ]

  for (const [legacy, unicode] of cases) {
    it(`converts ${JSON.stringify(legacy)} to Unicode`, () => {
      assert.equal(toUnicodeBangla(legacy), unicode)
      assert.equal(normalizeBanglaText(legacy).conversion, 'converted')
    })
  }

  it('flags a confidently legacy paste so the field can offer to fix it', () => {
    assert.equal(isLikelyLegacyBangla('evsjv‡`k'), true)
    assert.equal(banglaHintFor('evsjv‡`k'), 'looks-legacy')
  })

  it('stays quiet on everything else, so the hint keeps meaning something', () => {
    assert.equal(banglaHintFor('ABC Electronics Ltd.'), 'none')
    assert.equal(banglaHintFor('ঢাকা'), 'none')
    assert.equal(banglaHintFor(''), 'none')
  })
})

describe('text that must not be touched', () => {
  const untouched = [
    'ABC Electronics Ltd.',
    'Mirpur, Dhaka',
    'House 12, Road 4, Block C',
    'WFA-2D4-GDEH-XX',
    '01712345678',
    '+8801712345678',
    'Zone-7 / PO-627143140',
    '12',
    "O'Brien & Sons (Pvt.) Ltd.",
  ]

  for (const value of untouched) {
    it(`leaves ${JSON.stringify(value)} exactly as it was`, () => {
      const result = normalizeBanglaText(value)
      assert.equal(result.value, value)
      assert.equal(result.conversion, 'unchanged')
    })
  }
})

describe('text that is already Unicode Bangla', () => {
  for (const value of ['ঢাকা', 'মোঃ আরিফ হোসেন', 'মিরপুর, ঢাকা']) {
    it(`preserves ${JSON.stringify(value)} rather than reordering it`, () => {
      const result = normalizeBanglaText(value)
      assert.equal(result.value, value)
      assert.equal(result.conversion, 'unchanged')
      assert.equal(containsUnicodeBangla(value), true)
    })
  }

  it('converting twice changes nothing the second time', () => {
    const once = toUnicodeBangla('evsjv‡`k')
    assert.equal(toUnicodeBangla(once), once)
  })
})

describe('conversion the operator asks for', () => {
  it('handles plain-ASCII Bijoy, which no heuristic could have detected', () => {
    // "XvKv" is legacy Bijoy for ঢাকা and is also a plausible English string.
    // Detection cannot tell them apart, so a person decides.
    assert.equal(normalizeBanglaText('XvKv').conversion, 'unchanged')
    assert.equal(forceBanglaConversion('XvKv'), 'ঢাকা')
  })

  it('is offered wherever there is something it could convert', () => {
    assert.equal(canOfferConversion('XvKv'), true)
    assert.equal(canOfferConversion('evsjv‡`k'), true)
  })

  it('is withdrawn once the value is Unicode Bangla, where it could only harm', () => {
    assert.equal(canOfferConversion('ঢাকা'), false)
    assert.equal(canOfferConversion('  '), false)
  })
})
