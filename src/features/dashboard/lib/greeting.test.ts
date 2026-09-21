import assert from 'node:assert/strict'
import { test } from 'node:test'
import { firstNameOf, greetingFor, greetingLine } from './greeting.ts'

test('the greeting follows the working day, not an even split of the clock', () => {
  assert.equal(greetingFor(0), 'Still up')
  assert.equal(greetingFor(4), 'Still up')
  assert.equal(greetingFor(5), 'Good morning')
  assert.equal(greetingFor(11), 'Good morning')
  assert.equal(greetingFor(12), 'Good afternoon')
  assert.equal(greetingFor(16), 'Good afternoon')
  assert.equal(greetingFor(17), 'Good evening')
  assert.equal(greetingFor(23), 'Good evening')
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

test('no name leaves no dangling comma', () => {
  // What a template gets wrong, and it shows on exactly the accounts whose
  // profile has not arrived yet.
  assert.equal(greetingLine(null, 9), 'Good morning')
  assert.equal(greetingLine('  ', 9), 'Good morning')
  assert.equal(greetingLine('Rahim', 9), 'Good morning, Rahim')
})
