import { api } from '@/lib/axios'
import type {
  LocationListParams,
  LocationListResult,
  LocationRecord,
  LocationRemoval,
  LocationResolution,
  LocationStats,
  LocationType,
  PageMeta,
  ThanaOption,
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

const BASE = '/locations'

/**
 * Empty values and `all` are dropped rather than sent, so the request URL —
 * and therefore the query cache key — stays minimal. The same shape every
 * other list in this app uses.
 */
function filterParams(params: LocationListParams): Record<string, string> {
  return {
    ...(params.search ? { search: params.search } : {}),
    ...(params.district ? { district: params.district } : {}),
    ...(params.locationType !== 'all' ? { locationType: params.locationType } : {}),
    ...(params.active !== 'all' ? { active: params.active } : {}),
  }
}

export async function fetchLocations(params: LocationListParams): Promise<LocationListResult> {
  const { data } = await api.get<ApiListEnvelope<LocationRecord[]>>(BASE, {
    params: { page: params.page, limit: params.limit, ...filterParams(params) },
  })

  return { records: data.data, meta: data.meta }
}

export async function fetchLocationStats(): Promise<LocationStats> {
  const { data } = await api.get<ApiEnvelope<LocationStats>>(`${BASE}/stats`)
  return data.data
}

/** Every district with at least one active thana — the top of the cascade. */
export async function fetchDistricts(): Promise<string[]> {
  const { data } = await api.get<ApiEnvelope<string[]>>(`${BASE}/districts`)
  return data.data
}

/**
 * The active thanas of one district, each carrying the location type it
 * derives. The type comes back with the thana rather than in a second request,
 * because the two are one fact and a selector that had to ask again could show
 * a stale one in between.
 */
export async function fetchThanas(district: string): Promise<ThanaOption[]> {
  const { data } = await api.get<ApiEnvelope<ThanaOption[]>>(`${BASE}/thanas`, {
    params: { district },
  })
  return data.data
}

export interface ResolveLocationArgs {
  thana: string
  district: string
  deliveryAddress: string
}

/**
 * What a piece of challan text resolves to, asked before anything is filed.
 *
 * Advisory only. The server resolves again at submit time from the values that
 * actually get stored, so what this returns can never be the thing a record is
 * built on — it is what the entry form shows the operator so they are not
 * surprised by what lands.
 *
 * Three fields and no more: nothing about the customer is in the request,
 * because this is the one call in the app that may be forwarded to an external
 * service.
 */
export async function resolveLocation(args: ResolveLocationArgs): Promise<LocationResolution> {
  const { data } = await api.post<ApiEnvelope<LocationResolution>>(`${BASE}/resolve`, args, {
    /**
     * Shorter than the shared sixty seconds. This runs while somebody is
     * typing a challan, and the right answer to a slow lookup is to carry on
     * with the location blank rather than to hold up the form.
     */
    timeout: 25_000,
  })
  return data.data
}

export interface CreateLocationArgs {
  district: string
  thana: string
  locationType: LocationType
  isActive: boolean
}

export async function createLocation(args: CreateLocationArgs): Promise<LocationRecord> {
  const { data } = await api.post<ApiEnvelope<LocationRecord>>(BASE, args)
  return data.data
}

export interface UpdateLocationArgs extends Partial<CreateLocationArgs> {
  id: string
}

export async function updateLocation({
  id,
  ...changes
}: UpdateLocationArgs): Promise<LocationRecord> {
  const { data } = await api.patch<ApiEnvelope<LocationRecord>>(`${BASE}/${id}`, changes)
  return data.data
}

/**
 * Removing a location.
 *
 * Answers 200 either way and says which of the two things happened: a row
 * challans reference is deactivated rather than deleted, because those records
 * read their district, thana and type through it. The caller has to render
 * that distinction rather than assume a deletion.
 */
export async function deleteLocation(id: string): Promise<LocationRemoval> {
  const { data } = await api.delete<ApiEnvelope<LocationRemoval>>(`${BASE}/${id}`)
  return data.data
}
