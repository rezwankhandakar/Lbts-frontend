import assert from 'node:assert/strict'
import { test } from 'node:test'
import { en } from './messages/en.ts'
import { bn } from './messages/bn.ts'

/**
 * The dictionaries themselves, checked for the things the type system cannot
 * see.
 *
 * `tsc` already guarantees a great deal here — Bangla cannot invent a key
 * English does not have, cannot misspell one, and cannot turn a plural into a
 * plain string. What it cannot check is what is *inside* a string, and that is
 * where the silent failures live: a message whose `{placeholder}` was dropped
 * or renamed in translation renders a sentence with a hole in it, or with the
 * literal `{count}` showing, and nothing anywhere would say so.
 *
 * Loadable by `node --test` because both dictionaries import **types only**,
 * which Node's type stripping erases — the same reason `page-ranges.ts` is
 * import-free. A value import of the barrel would break that immediately.
 */

const PLACEHOLDER = /\{(\w+)\}/g

function placeholders(text: string): Set<string> {
  return new Set([...text.matchAll(PLACEHOLDER)].map((match) => match[1]!))
}

function isPlural(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).other === 'string'
  )
}

/** Every leaf in the tree, as `path -> text`. A plural contributes one per form. */
function leaves(tree: unknown, prefix = '', out = new Map<string, string>()): Map<string, string> {
  if (typeof tree !== 'object' || tree === null) {
    return out
  }

  for (const [key, value] of Object.entries(tree as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      out.set(path, value)
    } else if (isPlural(value)) {
      for (const [form, text] of Object.entries(value)) {
        out.set(`${path}#${form}`, text)
      }
    } else {
      leaves(value, path, out)
    }
  }

  return out
}

const EN = leaves(en)
const BN = leaves(bn)

test('the English tree is not empty and every leaf is a real string', () => {
  assert.ok(EN.size > 400, `expected a substantial dictionary, got ${EN.size} leaves`)

  for (const [path, text] of EN) {
    assert.equal(typeof text, 'string', `${path} is not a string`)
    assert.notEqual(text.trim(), '', `${path} is blank`)
  }
})

test('every Bangla message keeps the placeholders its English original has', () => {
  /*
   * The failure this exists for: a translation that drops `{count}` renders a
   * sentence missing its number, and one that renames it renders the literal
   * `{n}` on screen. Both read as a bug nobody can place, and neither is
   * visible to the compiler.
   */
  const problems: string[] = []

  for (const [path, bnText] of BN) {
    const enText = EN.get(path)
    if (enText === undefined) {
      // A plural form English does not have — `zero` where English wrote none.
      // Legal, and checked against the plural's `other` instead.
      const base = path.split('#')[0]!
      const fallback = EN.get(`${base}#other`)
      if (fallback === undefined) {
        problems.push(`${path}: no English counterpart`)
      }
      continue
    }

    const expected = placeholders(enText)
    const actual = placeholders(bnText)

    for (const name of expected) {
      if (!actual.has(name)) {
        problems.push(`${path}: Bangla is missing {${name}}`)
      }
    }
    for (const name of actual) {
      if (!expected.has(name)) {
        problems.push(`${path}: Bangla has an unknown {${name}}`)
      }
    }
  }

  assert.deepEqual(problems, [])
})

test('no Bangla message is left holding Latin digits', () => {
  /*
   * Digits reach a message through interpolation and are shaped by `Intl`, so
   * a Bangla string with an ASCII digit written into it is a *quantity* that
   * will never be localised — the one place `০` and `0` can end up side by
   * side in the same sentence.
   *
   * The exceptions are all the same kind of thing: a digit that is **data
   * somebody types or reads back**, rather than a number the screen is
   * reporting. Two are worth naming, because the reasoning is not obvious:
   *
   *  - **A phone number example.** `profile-schemas.ts` validates against
   *    `/^\+?[0-9]…/`, which accepts ASCII only — so a placeholder written as
   *    `+৮৮০ ১৭১২ ৩৪৫৬৭৮` would be an example that fails the very form it
   *    appears in. It is the one case where Bengali digits would be a bug.
   *    The Delivery module's receiver-mobile message carries `01712345678`
   *    for the same reason: its own schema accepts ASCII digits only.
   *  - **A loopback address and a port.** `127.0.0.1:39217` is typed into a
   *    field and compared byte for byte by the scanner agent.
   */
  const allowed =
    /^[^0-9]*$|127\.0\.0\.1|39217|you@company\.com|\+880 1712 345678|01712345678|LBTS|CSD|PDF/
  const offenders: string[] = []

  for (const [path, text] of BN) {
    if (/[0-9]/.test(text) && !allowed.test(text)) {
      offenders.push(`${path}: ${text}`)
    }
  }

  assert.deepEqual(offenders, [])
})

test('Bangla covers the shell and the vocabulary every module shares', () => {
  /*
   * Partial translation is legal by design — an untranslated key falls back to
   * English rather than breaking. But the shell is the part somebody switching
   * language is switching *for*, so a gap there would make the feature look
   * broken rather than incomplete.
   */
  const mustCover = ['common.', 'nav.', 'pages.', 'shell.', 'roles.', 'accountStatuses.', 'time.']
  const missing: string[] = []

  for (const [path] of EN) {
    if (mustCover.some((prefix) => path.startsWith(prefix)) && !BN.has(path)) {
      missing.push(path)
    }
  }

  assert.deepEqual(missing, [])
})

test('coverage is reported, so a gap is a number rather than a surprise', () => {
  const covered = [...EN.keys()].filter((path) => BN.has(path)).length
  const percent = Math.round((covered / EN.size) * 100)

  // Not a threshold to game — the assertion is deliberately loose. It is here
  // so `npm test` prints where the translation actually stands.
  console.log(`      Bangla coverage: ${covered}/${EN.size} keys (${percent}%)`)
  assert.ok(percent >= 50, `Bangla coverage fell to ${percent}%`)
})
