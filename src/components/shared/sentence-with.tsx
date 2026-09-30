import { Fragment } from 'react'
import type { ReactNode } from 'react'

interface SentenceWithProps {
  /** The whole sentence, already translated, with its placeholders left unsubstituted. */
  text: string
  /** Override only where a message needs a different placeholder name. */
  placeholder?: string
  /**
   * More than one drawn value, by placeholder name without the braces:
   * `{ driver: <strong>…</strong>, vehicle: <strong>…</strong> }`.
   *
   * Given this, `children` is not read — a sentence either has one drawn value
   * or several, and mixing the two spellings in one call site would make the
   * order they are substituted in a thing somebody has to work out.
   */
  parts?: Record<string, ReactNode>
  children?: ReactNode
}

/**
 * One sentence, with some of its values drawn as nodes.
 *
 * This replaces the shape it is named after: a message cut into a head and a
 * tail with a `<Link>` or a `<strong>` stitched between them in JSX. That can
 * only ever be right in one language — Bangla routinely puts the linked value
 * where English puts the tail, and the fragments then read as two half-sentences
 * either side of a link. So the sentence stays a **single message** and the
 * *placeholders* are what move.
 *
 * The caller translates the whole message with every other value supplied and
 * the drawn ones deliberately left out; `interpolate` passes an unsupplied
 * placeholder through untouched, and this splits on them and drops each node
 * into its gap.
 *
 * A message missing a placeholder renders as itself, so a translation that
 * forgot one loses that node rather than the sentence.
 */
export function SentenceWith({
  text,
  placeholder = '{link}',
  parts,
  children,
}: SentenceWithProps) {
  const nodes = parts ?? { [placeholder.replace(/[{}]/g, '')]: children }

  /**
   * Split on every placeholder at once rather than one after another, so the
   * order the names are listed in cannot decide the order they are drawn in:
   * what decides that is the sentence.
   */
  const names = Object.keys(nodes)
  const pattern = new RegExp(`\\{(${names.map(escape).join('|')})\\}`, 'g')
  const pieces: ReactNode[] = []
  let at = 0

  for (const match of text.matchAll(pattern)) {
    if (match.index > at) pieces.push(text.slice(at, match.index))
    pieces.push(<Fragment key={`${match[1]}-${match.index}`}>{nodes[match[1]]}</Fragment>)
    at = match.index + match[0].length
  }

  if (at < text.length) pieces.push(text.slice(at))

  return <>{pieces}</>
}

/** A placeholder name is a plain word, but never trust one into a pattern. */
function escape(name: string): string {
  return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
