import assert from 'node:assert/strict'
import { test } from 'node:test'
import { localeFor, readStoredLocale, withChoice } from './locales.ts'

/**
 * Which language a screen opens in, as decisions.
 *
 * The rule: the office defaults to English, a vendor account to Bangla, and a
 * press of the toggle is remembered for whichever of the two pressed it.
 */

const NONE = { staff: null, vendor: null } as const

test('each audience opens in its own default until it chooses', () => {
  assert.equal(localeFor('staff', NONE), 'en')
  assert.equal(localeFor('vendor', NONE), 'bn')
})

test('a choice wins over the default, for the audience that made it only', () => {
  const vendorChoseEnglish = withChoice(NONE, 'vendor', 'en')
  assert.equal(localeFor('vendor', vendorChoseEnglish), 'en')

  const staffChoseBangla = withChoice(NONE, 'staff', 'bn')
  assert.equal(localeFor('staff', staffChoseBangla), 'bn')
  assert.equal(localeFor('vendor', staffChoseBangla), 'bn')
  // An Admin who set this machine to Bangla does not decide a vendor's
  // default, and neither does one who set it to English.
  assert.equal(localeFor('vendor', withChoice(NONE, 'staff', 'en')), 'bn')
})

test('withChoice replaces one audience and leaves the other alone', () => {
  const chosen = withChoice(withChoice(NONE, 'staff', 'bn'), 'vendor', 'en')
  assert.deepEqual(chosen, { staff: 'bn', vendor: 'en' })
  assert.deepEqual(NONE, { staff: null, vendor: null })
})

test('nothing stored is staff in English', () => {
  assert.deepEqual(readStoredLocale(undefined), {
    locale: 'en',
    audience: 'staff',
    chosen: { staff: null, vendor: null },
  })
  assert.equal(readStoredLocale(null).locale, 'en')
  assert.equal(readStoredLocale('bn').locale, 'en')
})

test('a value from before audiences existed is a staff choice', () => {
  const stored = readStoredLocale({ locale: 'bn' })
  assert.deepEqual(stored, {
    locale: 'bn',
    audience: 'staff',
    chosen: { staff: 'bn', vendor: null },
  })
  // ...so a vendor signing in on that browser still gets the vendor default.
  assert.equal(localeFor('vendor', readStoredLocale({ locale: 'en' }).chosen), 'bn')
})

test('the locale on screen is derived, never trusted', () => {
  // A stored `locale` that disagrees with the rest is overruled by it.
  const stored = readStoredLocale({
    locale: 'en',
    audience: 'vendor',
    chosen: { staff: 'en', vendor: null },
  })
  assert.equal(stored.locale, 'bn')
})

test('anything unrecognised in storage falls back rather than breaking', () => {
  const stored = readStoredLocale({
    locale: 'fr',
    audience: 'driver',
    chosen: { staff: 'de', vendor: 7 },
  })
  assert.deepEqual(stored, {
    locale: 'en',
    audience: 'staff',
    chosen: { staff: null, vendor: null },
  })
})
