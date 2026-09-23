/**
 * The journal's arithmetic: which day a row belongs to, and how a recorded
 * value reads.
 *
 * **This file imports nothing**, which is the point. `node --test` resolves
 * module specifiers the way Node does and knows nothing about the `@/` alias,
 * so anything tested directly has to be loadable without one — the rule
 * `page-ranges.ts` and `labour-bill-math.ts` already follow. `activity-meta.ts`
 * re-exports everything here, so callers import from one place and the
 * alias-free file owns the value.
 *
 * It is generic over `{ createdAt }` rather than typed to `ActivityRecord` for
 * the same reason: the record type reaches `@/lib/roles`, and a test that
 * could not load the file would be a test nobody writes.
 */

/** A timestamped row — the only thing grouping needs to know about one. */
export interface Timestamped {
  createdAt: string
}

/**
 * The day a row belongs to, in the **viewer's own calendar**.
 *
 * Local rather than UTC, and this is the decision the whole grouping turns on:
 * the timeline groups by day, and a Dhaka evening is already the next UTC day
 * for six hours out of every twenty-four. Keying on the ISO string would file
 * an eight o'clock delivery under tomorrow's heading, which is the sort of
 * wrongness nobody reports and everybody works around.
 */
export function dayKeyOf(iso: string): string {
  const value = new Date(iso)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
    value.getDate(),
  ).padStart(2, '0')}`
}

/**
 * How many days ago a row was, in whole calendar days rather than in
 * twenty-four hour blocks.
 *
 * Both sides are reduced to local midnight first, so something at 11pm last
 * night is "1 day ago" at 1am rather than "0" — the same correction
 * `daysUntilExpiry` makes in the Vendor module, and for the same reason: a
 * person counts days by the date on them, not by elapsed hours.
 */
export function daysAgo(iso: string, now: Date): number {
  const value = new Date(iso)
  const startOfRow = new Date(value.getFullYear(), value.getMonth(), value.getDate())
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return Math.round((startOfToday.getTime() - startOfRow.getTime()) / 86_400_000)
}

/**
 * Rows gathered under the day they happened.
 *
 * Runs of neighbours rather than a sort: the list arrives newest-first from
 * the server, so a day is a contiguous block and nothing has to be ordered
 * twice. That also means a page boundary can split a day across two pages,
 * which is correct — the second page opens with the rest of that day under its
 * own heading rather than pretending to start a new one.
 */
export function groupByDay<T extends Timestamped>(records: T[]): { day: string; rows: T[] }[] {
  const groups: { day: string; rows: T[] }[] = []

  for (const record of records) {
    const key = dayKeyOf(record.createdAt)
    const last = groups[groups.length - 1]

    if (last && last.day === key) {
      last.rows.push(record)
    } else {
      groups.push({ day: key, rows: [record] })
    }
  }

  return groups
}

/**
 * A recorded value, as words.
 *
 * The one distinction worth keeping: `null` is a value that was **not set**
 * and `''` is one that was **blank**. They look identical on a form and are
 * different facts in an audit trail — a note nobody ever wrote against a note
 * somebody cleared — so the diff stores them apart and this reads them apart.
 */
export function changeValueText(value: string | null): string {
  if (value === null) {
    return 'not set'
  }
  return value === '' ? 'blank' : value
}

/**
 * The initials drawn where an actor has no photo — the journal stores none,
 * because it keeps the actor's *name* as a copy so a row survives the account.
 *
 * First and last, never a middle: "Md Rezwan Khandaker" is RK to the people
 * who work with them, and three letters in a 20px circle is a smudge.
 */
export function actorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return '?'
  }
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}
