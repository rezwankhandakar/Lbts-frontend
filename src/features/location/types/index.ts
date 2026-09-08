import type { UserRole } from '@/lib/roles'

/**
 * The Location Master as the client sees it. Mirrors
 * `LBTS-Backend/src/modules/location/location.constants.ts` and
 * `location.serializer.ts`; the backend is the source of truth. Change one,
 * change both.
 */

/**
 * What kind of place a district/thana pair is.
 *
 * A closed set, and deliberately not something any form types. The
 * classification belongs to the pair — Mirpur Model is ISD whoever is
 * delivering there — so it is read off the master record rather than entered
 * beside it.
 */
export const LOCATION_TYPES = ['ISD', 'OSD-Thana', 'OSD-Metro'] as const
export type LocationType = (typeof LOCATION_TYPES)[number]

/** How a challan's location came to be decided. Diagnostic, not for operators. */
export const LOCATION_SOURCES = [
  'master_exact',
  'master_normalized',
  'master_fuzzy',
  'gemini_assisted',
  'admin_manual',
] as const
export type LocationSource = (typeof LOCATION_SOURCES)[number]

/**
 * The sources that were a machine's *inexact* decision. Mirrors
 * `REVIEWABLE_LOCATION_SOURCES` in `location.constants.ts`, which is what the
 * `review` list filter actually queries on — change one, change both.
 *
 * `master_exact` is out because there is nothing to compare: the text was the
 * master row, character for character. `admin_manual` is out because it is
 * what a review produces, and a queue that keeps handing back decisions
 * somebody already made is a queue nobody finishes.
 */
export const REVIEWABLE_LOCATION_SOURCES: readonly LocationSource[] = [
  'master_normalized',
  'master_fuzzy',
  'gemini_assisted',
]

/** Whether this location was inferred rather than read or chosen. */
export function isReviewableLocation(location: { source: LocationSource } | null): boolean {
  return location !== null && REVIEWABLE_LOCATION_SOURCES.includes(location.source)
}

/**
 * Whether a challan's location is settled.
 *
 * Two values and no third. "The machine had a guess it was not sure about" is
 * not a state this system records — an uncertain match leaves the location
 * blank, because a blank is always better than a wrong district.
 */
export const LOCATION_STATUSES = ['Verified', 'Pending'] as const
export type LocationStatus = (typeof LOCATION_STATUSES)[number]

/**
 * Reading the master list is open to everyone who may reach a challan; writing
 * it is Admin-only. Mirrors `location.constants.ts`. These decide what the UI
 * offers; the API decides what actually happens.
 */
export const LOCATION_READ_ROLES: readonly UserRole[] = ['Admin', 'Manager', 'CEO', 'OpEx']
export const LOCATION_MANAGE_ROLES: readonly UserRole[] = ['Admin']

export function canReadLocations(role: UserRole | null): boolean {
  return role !== null && LOCATION_READ_ROLES.includes(role)
}

export function canManageLocations(role: UserRole | null): boolean {
  return role !== null && LOCATION_MANAGE_ROLES.includes(role)
}

export interface ActorRef {
  id: string
  name: string
}

export interface LocationRecord {
  id: string
  district: string
  thana: string
  locationType: LocationType
  isActive: boolean
  /** True for a row from the supplied master list rather than one an Admin added. */
  isSeeded: boolean
  createdBy: ActorRef | null
  updatedBy: ActorRef | null
  createdAt: string
  updatedAt: string
}

/** One thana of a district, with the type choosing it derives. */
export interface ThanaOption {
  id: string
  thana: string
  locationType: LocationType
}

/**
 * Where a challan actually went.
 *
 * Separate from the `thana` and `district` text on the record, which is what
 * an operator transcribed. The two are shown side by side rather than one
 * replacing the other.
 */
export interface ResolvedLocationRef {
  masterId: string
  district: string
  thana: string
  locationType: LocationType
  source: LocationSource
  confidence: number
  resolvedAt: string
  resolvedBy: ActorRef | null
}

/** A row the resolver offers when it could not settle on one. */
export interface LocationCandidate {
  id: string
  district: string
  thana: string
  locationType: LocationType
}

export interface LocationResolution {
  resolved: {
    masterId: string
    district: string
    thana: string
    locationType: LocationType
    source: LocationSource
    confidence: number
  } | null
  status: LocationStatus
  /** Already phrased for an operator by the server. Rendered as it arrives. */
  message: string
  candidates: LocationCandidate[]
  usedGemini: boolean
}

export interface GeminiUsage {
  configured: boolean
  calls: number
  cacheHits: number
  accepted: number
  lowConfidence: number
  rejected: number
  errors: number
  lastError: string | null
  lastErrorAt: string | null
  pausedUntil: string | null
}

export interface LocationStats {
  total: number
  active: number
  inactive: number
  districts: number
  byType: Record<LocationType, number>
  gemini: GeminiUsage
}

export type LocationTypeFilter = LocationType | 'all'
export type LocationActiveFilter = 'all' | 'active' | 'inactive'

export interface LocationListParams {
  page: number
  limit: number
  search: string
  district: string
  locationType: LocationTypeFilter
  active: LocationActiveFilter
}

export type LocationFilterPatch = Partial<Omit<LocationListParams, 'page' | 'limit'>>

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface LocationListResult {
  records: LocationRecord[]
  meta: PageMeta
}

/** What removing a location actually did — see `removeLocation` on the server. */
export interface LocationRemoval {
  id: string
  /** True when it was deactivated instead, because challans still reference it. */
  deactivated: boolean
  challanCount: number
}
