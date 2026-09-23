import type { UserRole } from '@/lib/roles'

/**
 * The activity journal as the client sees it. Mirrors
 * `LBTS-Backend/src/modules/activity/activity.constants.ts` and
 * `activity.serializer.ts`; the backend is the source of truth. Change one,
 * change both.
 *
 * **The action strings are deliberately not mirrored here.** Modules,
 * categories and severities are — they name icons, colours and filter chips,
 * so the UI has to know them by name — but the sixty action strings behind
 * them are *data*, and `GET /activity/filters` serves them with their labels.
 * A hand-copied list of sixty would be sixty chances to drift, and the one
 * thing a journal cannot afford is a filter that quietly matches nothing.
 */

/** Which part of the system a row came from. */
export const ACTIVITY_MODULES = [
  'Administration',
  'Vendor',
  'Delivery',
  'Gate Pass',
  'Challan',
  'Location',
  'Product Rate',
  'Excel Bill',
  'Labour Bill',
  'Accounts',
] as const
export type ActivityModule = (typeof ACTIVITY_MODULES)[number]

/** What kind of change it was — the filter for "everything anybody deleted". */
export const ACTIVITY_CATEGORIES = [
  'create',
  'update',
  'status',
  'delete',
  'access',
  'money',
  'document',
] as const
export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number]

/**
 * How much a row deserves to be noticed. `critical` is about being quietly
 * wrong or hard to undo rather than about volume — a deletion, a change to
 * who may do what, a corrected money entry, an edit to the reference data
 * every future record is priced against.
 */
export const ACTIVITY_SEVERITIES = ['info', 'notice', 'critical'] as const
export type ActivitySeverity = (typeof ACTIVITY_SEVERITIES)[number]

/** The kinds of record a row can name. */
export const ACTIVITY_ENTITY_TYPES = [
  'User',
  'Vendor',
  'Vehicle',
  'Driver',
  'Assignment',
  'Document',
  'Trip',
  'GatePass',
  'Challan',
  'Location',
  'ProductRate',
  'Bill',
  'LabourBill',
  'AccountsEntry',
] as const
export type ActivityEntityType = (typeof ACTIVITY_ENTITY_TYPES)[number]

/**
 * **Read is `Admin`, `Manager` and `CEO`, and nothing writes.** The journal
 * spans every module, so it carries what Accounts carries — and Accounts' own
 * audience is exactly these three. Mirrors `ACTIVITY_READ_ROLES`.
 *
 * Exporting is narrower still: reading a page answers a question, and
 * downloading five thousand rows of who did what is a copy of the audit trail
 * leaving the building.
 */
export const ACTIVITY_READ_ROLES: readonly UserRole[] = ['Admin', 'Manager', 'CEO']
export const ACTIVITY_EXPORT_ROLES: readonly UserRole[] = ['Admin']

export function canReadActivity(role: UserRole | null): boolean {
  return role !== null && ACTIVITY_READ_ROLES.includes(role)
}

export function canExportActivity(role: UserRole | null): boolean {
  return role !== null && ACTIVITY_EXPORT_ROLES.includes(role)
}

/** One field that moved, as two rendered strings. Null means absent, '' empty. */
export interface ActivityChange {
  field: string
  label: string
  from: string | null
  to: string | null
}

/**
 * Who did it — the row's **own copy** of the name and the role, not a lookup.
 *
 * That is why a deleted account still says who it was, and why the role is the
 * one they held at the time rather than the one they hold now. Null only for a
 * row nothing recorded an actor for.
 */
export interface ActivityActorRef {
  id: string | null
  name: string
  role: string
}

export interface ActivityRecord {
  id: string
  /** The exact action string, e.g. `challan.deleted`. Data, not a union. */
  action: string
  module: ActivityModule
  category: ActivityCategory
  severity: ActivitySeverity
  /** A short verb phrase for the action, for where the summary is too long. */
  actionLabel: string

  entityType: ActivityEntityType
  entityId: string | null
  entityLabel: string

  summary: string
  changes: ActivityChange[]

  actor: ActivityActorRef | null
  vendorId: string | null
  createdAt: string
}

/** One action the deployment can write, as the filter dropdown offers it. */
export interface ActivityActionOption {
  action: string
  label: string
  module: string
  category: string
  severity: string
}

export interface ActivityActorOption {
  id: string | null
  name: string
  role: string
  count: number
}

export interface ActivityFilterOptions {
  actors: ActivityActorOption[]
  actions: ActivityActionOption[]
}

export interface ActivityBreakdown {
  key: string
  label: string
  count: number
}

export interface ActivityStats {
  /** Every figure answers the filters in force, never the page. */
  total: number
  today: number
  week: number
  critical: number
  actors: number
  byModule: ActivityBreakdown[]
  byCategory: ActivityBreakdown[]
  topActors: ActivityActorOption[]
  /**
   * The last fourteen days, oldest first, quiet days included as zero rows.
   * `date` is the instant a bucket starts — the server anchors buckets to the
   * viewer's own midnight, so only the viewer can name the day it is.
   */
  trend: { date: string; count: number }[]
}

export type ActivityModuleFilter = ActivityModule | 'all'
export type ActivityCategoryFilter = ActivityCategory | 'all'
export type ActivitySeverityFilter = ActivitySeverity | 'all'
export type ActivityEntityFilter = ActivityEntityType | 'all'

export interface ActivityListParams {
  page: number
  limit: number
  search: string
  module: ActivityModuleFilter
  category: ActivityCategoryFilter
  severity: ActivitySeverityFilter
  action: string | 'all'
  entityType: ActivityEntityFilter
  actorId: string
  /** `YYYY-MM-DD`, both inclusive. Empty means unbounded on that side. */
  from: string
  to: string
}

export type ActivityFilterPatch = Partial<Omit<ActivityListParams, 'page' | 'limit'>>

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ActivityListResult {
  records: ActivityRecord[]
  meta: PageMeta
}
