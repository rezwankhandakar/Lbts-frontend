import { api } from '@/lib/axios'
import { filenameFrom, withBlobMessage } from '@/lib/download-error'
import type {
  ActivityFilterOptions,
  ActivityListParams,
  ActivityListResult,
  ActivityRecord,
  ActivityStats,
  PageMeta,
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

const BASE = '/activity'

/**
 * The filters, as one object used by the list, the overview and the export.
 *
 * Shared rather than copied, exactly as `gatePassFilterFields` is on the
 * server: a downloaded file must never describe a set of rows nobody was
 * looking at, and neither must the tiles above the list. Empty values and
 * `all` are dropped rather than sent, so the request URL — and therefore the
 * query cache key — stays minimal.
 */
export function filterParams(params: ActivityListParams): Record<string, string> {
  return {
    ...(params.search ? { search: params.search } : {}),
    ...(params.module !== 'all' ? { module: params.module } : {}),
    ...(params.category !== 'all' ? { category: params.category } : {}),
    ...(params.severity !== 'all' ? { severity: params.severity } : {}),
    ...(params.action !== 'all' ? { action: params.action } : {}),
    ...(params.entityType !== 'all' ? { entityType: params.entityType } : {}),
    ...(params.actorId ? { actorId: params.actorId } : {}),
    ...(params.from ? { from: params.from } : {}),
    ...(params.to ? { to: params.to } : {}),
  }
}

export async function fetchActivity(params: ActivityListParams): Promise<ActivityListResult> {
  const { data } = await api.get<ApiListEnvelope<ActivityRecord[]>>(BASE, {
    params: { page: params.page, limit: params.limit, ...filterParams(params) },
  })

  return { records: data.data, meta: data.meta }
}

/**
 * The overview.
 *
 * `today` is the viewer's own midnight as an instant, because a journal row is
 * a moment rather than a calendar day and the server's UTC midnight is six
 * hours out of step with Dhaka's. The same reasoning Delivery's stats and the
 * Accounts overview follow, sent as an instant rather than a `YYYY-MM-DD`
 * because here the boundary really is a point in time.
 */
export async function fetchActivityStats(params: ActivityListParams): Promise<ActivityStats> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const { data } = await api.get<ApiEnvelope<ActivityStats>>(`${BASE}/stats`, {
    params: { today: todayStart.toISOString(), ...filterParams(params) },
  })
  return data.data
}

/** Who has done something, and what actions this deployment writes. */
export async function fetchActivityFilters(): Promise<ActivityFilterOptions> {
  const { data } = await api.get<ApiEnvelope<ActivityFilterOptions>>(`${BASE}/filters`)
  return data.data
}

/** One vendor's journal, as the vendor page reads it. */
export async function fetchVendorActivity(
  vendorId: string,
  limit: number,
): Promise<ActivityRecord[]> {
  const { data } = await api.get<ApiEnvelope<ActivityRecord[]>>(`/vendors/${vendorId}/activity`, {
    params: { limit },
  })
  return data.data
}

/** Longer than the shared timeout: a cold instance builds the whole workbook first. */
const EXPORT_TIMEOUT = 120_000

export async function exportActivity(
  params: ActivityListParams,
): Promise<{ blob: Blob; filename: string }> {
  try {
    const response = await api.get<Blob>(`${BASE}/export`, {
      params: filterParams(params),
      responseType: 'blob',
      timeout: EXPORT_TIMEOUT,
    })
    return {
      blob: response.data,
      filename: filenameFrom(response.headers['content-disposition'], 'lbts-activity.xlsx'),
    }
  } catch (error) {
    throw await withBlobMessage(error)
  }
}
