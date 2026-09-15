/**
 * The client half of a spreadsheet-style column filter — the shapes a column
 * dropdown sends and receives, shared by every sheet that has one. Mirrors
 * `LBTS-Backend/src/utils/column-filters.ts`.
 *
 * Import-free, so `node --test` can load anything that uses it.
 */

/** A ticked value. `null` is `(Blanks)`. */
export type ColumnFilterValue = string | number | null

export interface ColumnValuesResult {
  values: { value: ColumnFilterValue; count: number }[]
  /** More distinct values exist than one dropdown lists. */
  truncated: boolean
}

export function isBlankFilterValue(value: ColumnFilterValue): boolean {
  return value === null || value === ''
}

export function sameFilterValue(a: ColumnFilterValue, b: ColumnFilterValue): boolean {
  return (isBlankFilterValue(a) && isBlankFilterValue(b)) || a === b
}

/** The column filters with one column's ticks replaced — or removed, for null. */
export function setColumnFilter<K extends string>(
  columns: Partial<Record<K, ColumnFilterValue[]>>,
  column: K,
  values: ColumnFilterValue[] | null,
): Partial<Record<K, ColumnFilterValue[]>> {
  const next = { ...columns }
  if (values === null) {
    delete next[column]
  } else {
    next[column] = values
  }
  return next
}
