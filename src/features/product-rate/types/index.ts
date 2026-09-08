import type { LocationType } from '@/features/location/types'
import type { UserRole } from '@/lib/roles'

/**
 * The Product Rate card as the client sees it. Mirrors
 * `LBTS-Backend/src/modules/product-rate/product-rate.constants.ts` and
 * `product-rate.serializer.ts`; the backend is the source of truth. Change
 * one, change both.
 */

/**
 * How a rate is expressed.
 *
 * Two kinds, because the supplied card has two. Most products are one figure
 * per piece; Iron and Electric Kettle are written as "ek challan e prothom 5
 * pics 60, porer gulo 24 kore" — the first few pieces on a challan at one
 * figure and everything after at another.
 */
export const RATE_KINDS = ['flat', 'tiered'] as const
export type RateKind = (typeof RATE_KINDS)[number]

/** One figure per piece, however many there are. */
export interface FlatRate {
  kind: 'flat'
  amount: number
}

/**
 * The first `firstQty` pieces on one challan at `firstAmount` each, and every
 * piece after that at `restAmount`. The allowance belongs to the challan, not
 * to the row — two lines of the same product share one between them.
 */
export interface TieredRate {
  kind: 'tiered'
  firstQty: number
  firstAmount: number
  restAmount: number
}

export type Rate = FlatRate | TieredRate

/**
 * Reading the rate card is open to everyone who may reach a challan; writing
 * it is Admin-only. Mirrors `product-rate.constants.ts`. These decide what the
 * UI offers; the API decides what actually happens.
 */
export const PRODUCT_RATE_READ_ROLES: readonly UserRole[] = ['Admin', 'Manager', 'CEO', 'OpEx']
export const PRODUCT_RATE_MANAGE_ROLES: readonly UserRole[] = ['Admin']

export function canReadProductRates(role: UserRole | null): boolean {
  return role !== null && PRODUCT_RATE_READ_ROLES.includes(role)
}

export function canManageProductRates(role: UserRole | null): boolean {
  return role !== null && PRODUCT_RATE_MANAGE_ROLES.includes(role)
}

export interface ActorRef {
  id: string
  name: string
}

export interface ProductRateRecord {
  id: string
  productName: string
  /** Blank means the row prices this product whatever model a line names. */
  productModel: string
  capacity: string
  /**
   * One figure per location type. A column can be null only for a row written
   * before this shape existed or corrupted by hand — the API refuses to store
   * a partial rate — so the UI renders it as "not set" rather than as zero.
   */
  rates: Record<LocationType, Rate | null>
  isActive: boolean
  /** True for a row from the supplied card rather than one an Admin added. */
  isSeeded: boolean
  createdBy: ActorRef | null
  updatedBy: ActorRef | null
  createdAt: string
  updatedAt: string
}

/**
 * A product the rate card knows a model by.
 *
 * What the challan entry form asks for when an operator pastes a model: the
 * card's own spelling of the product, so the pricing step later on can insist
 * the product name match a row.
 */
export interface ModelMatch {
  id: string
  productName: string
  productModel: string
  capacity: string
}

export interface ProductRateStats {
  total: number
  active: number
  inactive: number
  /** Distinct product names — how many things the card actually covers. */
  products: number
  withModel: number
  withoutModel: number
  tiered: number
}

export type ProductRateModelFilter = 'all' | 'yes' | 'no'
export type ProductRateActiveFilter = 'all' | 'active' | 'inactive'

export interface ProductRateListParams {
  page: number
  limit: number
  search: string
  productName: string
  hasModel: ProductRateModelFilter
  active: ProductRateActiveFilter
}

export type ProductRateFilterPatch = Partial<Omit<ProductRateListParams, 'page' | 'limit'>>

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProductRateListResult {
  records: ProductRateRecord[]
  meta: PageMeta
}

/** What removing a row actually did — see `removeProductRate` on the server. */
export interface ProductRateRemoval {
  id: string
  /** True when it was deactivated instead, because challans cite it. */
  deactivated: boolean
  challanCount: number
}

/**
 * A product name the card knows, offered while somebody types in the product
 * box.
 *
 * Grouped by name rather than row by row: `Refrigerator` is sixty-six rows of
 * the card and one answer to "what is this product called". `modelCount` is
 * zero for a product the card prices outright — a hair dryer — which is what
 * lets the entry form say whether a model still has to be entered beside it.
 */
export interface ProductNameMatch {
  productName: string
  modelCount: number
}
