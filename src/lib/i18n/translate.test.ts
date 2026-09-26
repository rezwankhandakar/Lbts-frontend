import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  interpolate,
  resolveNode,
  selectPluralForm,
  translateKey,
} from './translate.ts'
import type { MessageTree } from './translate.ts'

/**
 * The translation core, tested as decisions rather than through a renderer —
 * the rule `page-ranges.ts` established. What is pinned here is the fallback
 * contract, because that is the thing that decides whether a half-translated
 * page reads as an English word in a Bangla sentence or as a blank button.
 */

const EN: MessageTree = {
  app: { name: 'LBTS' },
  common: {
    save: 'Save',
    greeting: 'Hello {name}',
    records: { zero: 'No records', one: '{count} record', other: '{count} records' },
    plain: { one: '{count} item', other: '{count} items' },
  },
}

const BN: MessageTree = {
  common: {
    save: 'সংরক্ষণ করুন',
    records: { zero: 'কোনো রেকর্ড নেই', one: '{count}টি রেকর্ড', other: '{count}টি রেকর্ড' },
  },
}

test('resolveNode walks a dot path to a leaf', () => {
  assert.equal(resolveNode(EN, 'common.save'), 'Save')
  assert.equal(resolveNode(EN, 'app.name'), 'LBTS')
})

test('resolveNode returns undefined rather than throwing on a bad path', () => {
  assert.equal(resolveNode(EN, 'common.missing'), undefined)
  assert.equal(resolveNode(EN, 'nope.nope.nope'), undefined)
  // Walking *through* a string must not throw either.
  assert.equal(resolveNode(EN, 'common.save.deeper'), undefined)
  assert.equal(resolveNode(undefined, 'common.save'), undefined)
})

test('resolveNode treats a plural as a leaf, never as a branch', () => {
  assert.equal(resolveNode(EN, 'common.records.one'), undefined)
})

test('interpolate substitutes named placeholders', () => {
  assert.equal(interpolate('Hello {name}', { name: 'Rezwan' }), 'Hello Rezwan')
  assert.equal(interpolate('{a} and {b}', { a: 1, b: 2 }), '1 and 2')
})

test('interpolate leaves an unfilled placeholder visible rather than printing undefined', () => {
  // On screen `{count}` is a bug somebody reports; "undefined items" is a
  // number nobody can explain.
  assert.equal(interpolate('{count} items'), '{count} items')
  assert.equal(interpolate('{count} items', {}), '{count} items')
})

test('selectPluralForm uses zero only where a wording was written for it', () => {
  const withZero = { zero: 'No records', one: '{count} record', other: '{count} records' }
  const withoutZero = { one: '{count} item', other: '{count} items' }

  assert.equal(selectPluralForm(withZero, 0), 'No records')
  assert.equal(selectPluralForm(withoutZero, 0), '{count} items')
  assert.equal(selectPluralForm(withZero, 1), '{count} record')
  assert.equal(selectPluralForm(withZero, 5), '{count} records')
  // A negative one is still one of something.
  assert.equal(selectPluralForm(withZero, -1), '{count} record')
})

test('a translated key is answered from the primary locale', () => {
  assert.equal(translateKey(BN, EN, 'common.save'), 'সংরক্ষণ করুন')
})

test('an untranslated key falls back to English rather than blank', () => {
  // The contract the whole module exists for: the worst failure available is
  // an English word on a Bangla page, never an empty button.
  assert.equal(translateKey(BN, EN, 'app.name'), 'LBTS')
  assert.equal(translateKey(BN, EN, 'common.greeting', { name: 'Karim' }), 'Hello Karim')
})

test('a key in neither tree returns the key itself', () => {
  assert.equal(translateKey(BN, EN, 'nothing.here'), 'nothing.here')
})

test('a path that stops on a branch returns the key rather than an object', () => {
  assert.equal(translateKey(BN, EN, 'common'), 'common')
})

test('plurals interpolate the count they selected on', () => {
  assert.equal(translateKey(BN, EN, 'common.records', { count: 0 }), 'কোনো রেকর্ড নেই')
  assert.equal(translateKey(BN, EN, 'common.records', { count: 1 }), '১টি রেকর্ড'.replace('১', '1'))
  assert.equal(translateKey(BN, EN, 'common.records', { count: 7 }), '7টি রেকর্ড')
})

test('a plural untranslated in the primary falls back to the English plural', () => {
  assert.equal(translateKey(BN, EN, 'common.plain', { count: 1 }), '1 item')
  assert.equal(translateKey(BN, EN, 'common.plain', { count: 4 }), '4 items')
})

test('a plural asked without a count reads as the zero case', () => {
  // Defensive rather than intended: a caller that forgets the count gets the
  // most neutral wording rather than a crash or an "undefined".
  assert.equal(translateKey(BN, EN, 'common.records'), 'কোনো রেকর্ড নেই')
})
