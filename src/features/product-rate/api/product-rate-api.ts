import { api } from '@/lib/axios'
import type { LocationType } from '@/features/location/types'
import type {
  ModelMatch,
  ProductNameMatch,
  PageMeta,
  ProductRateListParams,
  ProductRateListResult,
  ProductRateRecord,
  ProductRateRemoval,
  ProductRateStats,
  Rate,
} from '../types'

interface ApiEnvelope<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

interface ApiListEnvelope<T> extends ApiEnvelope<T> {
  meta: PageMeta
}

const BASE = '/product-rates'

/**
 * Empty values and `all` are dropped rather than sent, so the request URL —
 * and therefore the query cache key — stays minimal. The same shape every
 * other list in this app uses.
 */
function filterParams(params: ProductRateListParams): Record<string, string> {
  return {
    ...(params.search ? { search: params.search } : {}),
    ...(params.productName ? { productName: params.productName } : {}),
    ...(params.hasModel !== 'all' ? { hasModel: params.hasModel } : {}),
    ...(params.active !== 'all' ? { active: params.active } : {}),
  }
}

export async function fetchProductRates(
  params: ProductRateListParams,
): Promise<ProductRateListResult> {
  const { data } = await api.get<ApiListEnvelope<ProductRateRecord[]>>(BASE, {
    params: { page: params.page, limit: params.limit, ...filterParams(params) },
  })

  return { records: data.data, meta: data.meta }
}

export async function fetchProductRateStats(): Promise<ProductRateStats> {
  const { data } = await api.get<ApiEnvelope<ProductRateStats>>(`${BASE}/stats`)
  return data.data
}

/**
 * Which products the rate card knows this model by.
 *
 * The lookup behind the challan entry form's product suggestions. An exact key
 * match wins outright; a prefix match answers only when nothing matched
 * exactly, which is what makes it useful while somebody is still typing.
 */
export async function fetchModelMatches(model: string): Promise<ModelMatch[]> {
  const { data } = await api.get<ApiEnvelope<ModelMatch[]>>(`${BASE}/models`, {
    params: { model },
    /**
     * Shorter than the shared sixty seconds. This runs while somebody is
     * typing a challan, and the right answer to a slow lookup is to carry on
     * without a suggestion rather than to hold up the form.
     */
    timeout: 25_000,
  })
  return data.data
}

/**
 * Product names on the card, offered while somebody types in the product box.
 *
 * The counterpart to the model lookup, and the only assistance a model-less
 * product has: a hair dryer carries no model on the card, so there is nothing
 * to paste and the name is the only way in.
 */
export async function fetchProductNames(query: string): Promise<ProductNameMatch[]> {
  const { data } = await api.get<ApiEnvelope<ProductNameMatch[]>>(`${BASE}/products`, {
    params: { q: query },
    timeout: 25_000,
  })
  return data.data
}

export interface RateQuoteLine {
  masterId: string
  locationType: LocationType
  rate: Rate
  capacity: string
  amount: number
}

export interface RateQuote {
  items: (RateQuoteLine | null)[]
  total: number | null
  unpriced: number
}

export interface QuoteRatesArgs {
  locationType: LocationType
  items: { productName: string; model: string; qty: number }[]
}

/**
 * What a set of lines would be charged, asked before anything is filed.
 *
 * Advisory only. The server prices again at submit time from the values that
 * actually get stored, so what this returns can never be the thing a record is
 * built on — the same arrangement `resolveLocation` has, and for the same
 * reason.
 */
export async function quoteRates(args: QuoteRatesArgs): Promise<RateQuote> {
  const { data } = await api.post<ApiEnvelope<RateQuote>>(`${BASE}/quote`, args, {
    timeout: 25_000,
  })
  return data.data
}

export interface ProductRateFormArgs {
  productName: string
  productModel: string
  capacity: string
  rates: Record<LocationType, Rate>
  isActive: boolean
}

export async function createProductRate(
  args: ProductRateFormArgs,
): Promise<ProductRateRecord> {
  const { data } = await api.post<ApiEnvelope<ProductRateRecord>>(BASE, args)
  return data.data
}

export interface UpdateProductRateArgs extends Partial<ProductRateFormArgs> {
  id: string
}

export async function updateProductRate({
  id,
  ...changes
}: UpdateProductRateArgs): Promise<ProductRateRecord> {
  const { data } = await api.patch<ApiEnvelope<ProductRateRecord>>(`${BASE}/${id}`, changes)
  return data.data
}

/**
 * Removing a rate card row.
 *
 * Answers 200 either way and says which of the two things happened: a row
 * challans were charged from is deactivated rather than deleted, because
 * "where did this figure come from" has to stay answerable. The caller has to
 * render that distinction rather than assume a deletion.
 */
export async function deleteProductRate(id: string): Promise<ProductRateRemoval> {
  const { data } = await api.delete<ApiEnvelope<ProductRateRemoval>>(`${BASE}/${id}`)
  return data.data
}
