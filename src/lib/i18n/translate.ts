/**
 * The translation core: resolve a key, choose a plural form, interpolate.
 *
 * Import-free, the rule `page-ranges.ts` established, so `node --test` can load
 * it and the decisions in it are tested as decisions rather than through a
 * renderer. Everything here is pure — no store, no React, no DOM — which is
 * also what lets the same function serve a component, a toast raised from a
 * mutation callback, and a string built inside a `lib/` helper.
 *
 * The one rule the whole module is built around: **a missing translation is
 * never visible.** Bangla falls back to English, English falls back to the key
 * itself, and a key that does not exist at all returns the key rather than
 * `undefined` — so the worst failure available is an English word on a Bangla
 * page, never a blank button or the literal string "undefined".
 */

/**
 * A message with a count-dependent form. English needs two; Bangla's noun does
 * not inflect for number, so its `one` and `other` are usually identical — but
 * the surrounding sentence often still differs ("১টি" against "৩টি"), which is
 * why the shape is kept for both languages rather than collapsed for Bangla.
 */
export interface PluralMessage {
  /** Optional: a dedicated wording for nothing at all, where "0 items" reads badly. */
  zero?: string
  one: string
  other: string
}

export type MessageNode = string | PluralMessage | MessageTree

export interface MessageTree {
  readonly [key: string]: MessageNode
}

/** What may be substituted into a message. Dates and elements are formatted by the caller. */
export type InterpolationValues = Record<string, string | number>

/**
 * Every dot-separated path to a leaf in the tree. A `PluralMessage` is a leaf,
 * not a branch, so `common.items` resolves the plural rather than offering
 * `common.items.one` as a key somebody could ask for directly.
 *
 * This is what makes a mistyped key a build error instead of an English string
 * that nobody notices until it is on a customer's screen.
 */
export type LeafPath<T> = T extends string
  ? ''
  : T extends PluralMessage
    ? ''
    : {
        [K in keyof T & string]: LeafPath<T[K]> extends infer Rest extends string
          ? Rest extends ''
            ? K
            : `${K}.${Rest}`
          : never
      }[keyof T & string]

/**
 * A partial translation of a reference tree: every key optional, every string
 * leaf widened from its literal type back to `string`, every plural still a
 * plural. That combination is the point — a locale may translate some of the
 * app without inventing a key the English tree does not have, and without
 * quietly turning a plural into a plain string.
 */
export type Translation<T> = {
  [K in keyof T]?: T[K] extends string
    ? string
    : T[K] extends PluralMessage
      ? PluralMessage
      : T[K] extends MessageTree
        ? Translation<T[K]>
        : never
}

function isPlural(node: MessageNode | undefined): node is PluralMessage {
  return (
    typeof node === 'object' &&
    node !== null &&
    typeof (node as PluralMessage).other === 'string' &&
    typeof (node as PluralMessage).one === 'string'
  )
}

/**
 * Walk a dot path. Returns the node rather than a string, because the caller
 * still has to choose a plural form and the count lives with the caller.
 *
 * A path that runs off the end of the tree, or through a string, returns
 * undefined — which is the fallback signal rather than a thrown error. A
 * translation lookup must never be able to take a page down.
 */
export function resolveNode(tree: MessageTree | undefined, path: string): MessageNode | undefined {
  if (!tree) {
    return undefined
  }

  let node: MessageNode | undefined = tree

  for (const segment of path.split('.')) {
    if (typeof node !== 'object' || node === null || isPlural(node)) {
      return undefined
    }

    node = (node as MessageTree)[segment]

    if (node === undefined) {
      return undefined
    }
  }

  return node
}

/**
 * Pick the form a count calls for. `zero` is used only when it was written —
 * "no trips" reads better than "0 trips", but only somewhere that wording was
 * actually chosen, so an absent `zero` falls to `other` exactly as English
 * expects.
 */
export function selectPluralForm(message: PluralMessage, count: number): string {
  if (count === 0 && typeof message.zero === 'string') {
    return message.zero
  }

  return Math.abs(count) === 1 ? message.one : message.other
}

const PLACEHOLDER = /\{(\w+)\}/g

/**
 * Substitute `{name}` placeholders. A placeholder with no value is left exactly
 * as written rather than replaced with "undefined": on screen `{count}` is
 * visibly a bug somebody reports, where "undefined items" reads like a number
 * nobody can explain.
 */
export function interpolate(template: string, values?: InterpolationValues): string {
  if (!values) {
    return template
  }

  return template.replace(PLACEHOLDER, (match, name: string) => {
    const value = values[name]
    return value === undefined || value === null ? match : String(value)
  })
}

/**
 * Resolve one key against a locale's tree, then the fallback tree, then the key
 * itself. The order is the whole contract: a Bangla page shows Bangla where it
 * has been written and English where it has not, and never shows nothing.
 */
export function translateKey(
  primary: MessageTree | undefined,
  fallback: MessageTree | undefined,
  key: string,
  values?: InterpolationValues,
): string {
  const node = resolveNode(primary, key) ?? resolveNode(fallback, key)

  if (node === undefined) {
    return key
  }

  if (isPlural(node)) {
    const count = typeof values?.count === 'number' ? values.count : 0
    return interpolate(selectPluralForm(node, count), values)
  }

  if (typeof node !== 'string') {
    // A path that stopped on a branch. Returning the key makes it obvious.
    return key
  }

  return interpolate(node, values)
}
