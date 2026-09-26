import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hasBengaliDigits, shapeDigits, toBengaliDigits, toLatinDigits } from './numerals.ts'

/**
 * Digit shaping. What is pinned here is mostly what must *survive* the
 * conversion: this runs over strings that carry identifiers, and a challan
 * number whose digits were transliterated on their way to a barcode would be a
 * record nobody could scan.
 */

test('ASCII digits become Bengali digits', () => {
  assert.equal(toBengaliDigits('0123456789'), '০১২৩৪৫৬৭৮৯')
})

test('Bengali digits become ASCII digits', () => {
  assert.equal(toLatinDigits('০১২৩৪৫৬৭৮৯'), '0123456789')
})

test('the two are inverse over a formatted figure', () => {
  const formatted = '1,50,000.50'
  assert.equal(toLatinDigits(toBengaliDigits(formatted)), formatted)
})

test('punctuation, separators and currency signs pass through untouched', () => {
  assert.equal(toBengaliDigits('৳1,50,000.50'), '৳১,৫০,০০০.৫০')
  assert.equal(toBengaliDigits('2026-09-24'), '২০২৬-০৯-২৪')
  assert.equal(toBengaliDigits('—'), '—')
})

test('letters are never touched, so an identifier keeps its shape', () => {
  // A model code and a plate are read off paper character for character.
  assert.equal(toBengaliDigits('WCF-1D5-GDEL-LX'), 'WCF-১D৫-GDEL-LX')
  assert.equal(toBengaliDigits('Refrigerator'), 'Refrigerator')
})

test('an already-Bengali string is unchanged by conversion to Bengali', () => {
  assert.equal(toBengaliDigits('১২৩'), '১২৩')
})

test('Bangla letters are not mistaken for digits', () => {
  // The digit block sits directly below the letters; an off-by-a-few in the
  // code-point arithmetic would corrupt words rather than numbers.
  const word = 'চালান'
  assert.equal(toLatinDigits(word), word)
  assert.equal(toBengaliDigits(word), word)
  assert.equal(hasBengaliDigits(word), false)
})

test('hasBengaliDigits finds one anywhere in the string', () => {
  assert.equal(hasBengaliDigits('মোট ৫টি'), true)
  assert.equal(hasBengaliDigits('Total 5'), false)
  assert.equal(hasBengaliDigits(''), false)
})

test('shapeDigits converts for Bangla and leaves every other locale alone', () => {
  assert.equal(shapeDigits('1,500', 'bn'), '১,৫০০')
  assert.equal(shapeDigits('1,500', 'en'), '1,500')
})
