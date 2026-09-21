/**
 * How the dashboard addresses the person reading it.
 *
 * **Pure and import-free**, so `node --test` loads it without the `@/` alias,
 * and so the one thing here worth getting wrong — which name is a person's
 * name — is pinned by a test rather than by somebody opening the page at
 * nine in the morning.
 */

/**
 * "Good morning" against the **viewer's own clock**, never the server's.
 *
 * The same reason every "today" in this codebase is taken from the browser:
 * the server runs on UTC, which is six hours behind Dhaka, so a server-side
 * greeting would wish an operator good evening over their morning tea. The
 * boundaries are the ordinary Bangladeshi working day rather than an even
 * split of the clock — the office starts before nine and afternoon runs long.
 */
export function greetingFor(hour: number): string {
  if (hour < 5) return 'Still up'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/**
 * The first word of a name, which is what a greeting uses.
 *
 * It returns the **whole name** rather than an empty string when there is no
 * space in it, and an empty string when there is no name at all — the caller
 * then greets nobody in particular rather than greeting a blank. A Bangladeshi
 * name is routinely three or four words and the first is the one people answer
 * to, which is why this takes the head rather than trying to find a given
 * name inside it.
 */
export function firstNameOf(name: string | null | undefined): string {
  if (!name) return ''
  const trimmed = name.trim()
  if (trimmed.length === 0) return ''
  return trimmed.split(/\s+/)[0] ?? ''
}

/**
 * The whole line: "Good morning, Rahim" or just "Good morning".
 *
 * The comma belongs to the name and goes with it. A greeting that reads "Good
 * morning," with nothing after it is what a template gets wrong, and it is
 * visible on exactly the accounts whose profile has not finished loading.
 */
export function greetingLine(name: string | null | undefined, hour: number): string {
  const first = firstNameOf(name)
  const greeting = greetingFor(hour)
  return first ? `${greeting}, ${first}` : greeting
}
