import assert from 'node:assert/strict'
import { test } from 'node:test'
import { firstNameOf, greetingSlotFor } from './greeting.ts'

test('the greeting follows the working day, not an even split of the clock', () => {
  assert.equal(greetingSlotFor(0), 'lateNight')
  assert.equal(greetingSlotFor(4), 'lateNight')
  assert.equal(greetingSlotFor(5), 'morning')
  assert.equal(greetingSlotFor(11), 'morning')
  assert.equal(greetingSlotFor(12), 'afternoon')
  assert.equal(greetingSlotFor(16), 'afternoon')
  assert.equal(greetingSlotFor(17), 'evening')
  assert.equal(greetingSlotFor(23), 'evening')
})

test('a one-word name is used whole', () => {
  assert.equal(firstNameOf('Rahim'), 'Rahim')
})

test('a long Bangladeshi name gives its first word', () => {
  assert.equal(firstNameOf('Mohammad Rezwan Khandaker'), 'Mohammad')
})

test('extra whitespace does not become a name', () => {
  assert.equal(firstNameOf('   Karim   Uddin '), 'Karim')
  assert.equal(firstNameOf('   '), '')
  assert.equal(firstNameOf(''), '')
  assert.equal(firstNameOf(null), '')
  assert.equal(firstNameOf(undefined), '')
})

test('a Bangla name survives byte for byte', () => {
  // The same guarantee `bangla-text.ts` holds elsewhere: nothing here may
  // transform a name, only split it.
  assert.equal(firstNameOf('রেজওয়ান খন্দকার'), 'রেজওয়ান')
})

test('an absent name is an empty string, so the caller can greet nobody', () => {
  /*
   * The dangling-comma case this file used to own outright. Joining the
   * greeting to the name moved into the message tree — `{greeting}, {name}`
   * in English — because the comma is a fact about a language rather than
   * about a name, and a locale that joins them differently must be able to
   * say so. What stays testable here is the signal the caller branches on:
   * empty means "greet nobody in particular", and it has to be empty for
   * every shape of nothing.
   */
  for (const nothing of [null, undefined, '', '   ']) {
    assert.equal(firstNameOf(nothing), '')
  }
})
