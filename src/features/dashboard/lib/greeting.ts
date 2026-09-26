/**
 * How the dashboard addresses the person reading it.
 *
 * **Pure and import-free**, so `node --test` loads it without the `@/` alias,
 * and so the one thing here worth getting wrong — which name is a person's
 * name — is pinned by a test rather than by somebody opening the page at
 * nine in the morning.
 *
 * It returns a **slot rather than a sentence**, which is the one thing that
 * changed when the app learned a second language. A function that returned
 * "Good morning" could only ever be English, and moving it into the message
 * tree whole would have taken the time arithmetic — the part actually worth
 * testing — along with it. So the arithmetic stays here and the words live in
 * `dashboard.greeting`, keyed by what this returns.
 */

export type GreetingSlot = 'lateNight' | 'morning' | 'afternoon' | 'evening'

/**
 * Which greeting the hour calls for, against the **viewer's own clock**, never
 * the server's.
 *
 * The same reason every "today" in this codebase is taken from the browser:
 * the server runs on UTC, which is six hours behind Dhaka, so a server-side
 * greeting would wish an operator good evening over their morning tea. The
 * boundaries are the ordinary Bangladeshi working day rather than an even
 * split of the clock — the office starts before nine and afternoon runs long.
 */
export function greetingSlotFor(hour: number): GreetingSlot {
  if (hour < 5) return 'lateNight'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
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
