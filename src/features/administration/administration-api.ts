import { api } from '@/lib/axios'
import type { UserRole, UserStatus } from '@/lib/roles'
import type { AdminUser, PageMeta, UserListParams, UserListResult, UserStats } from './types'

interface ApiEnvelope<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

interface ApiListEnvelope<T> extends ApiEnvelope<T> {
  meta: PageMeta
}

const BASE = '/administration/users'

/**
 * Filtering and pagination are server-side. `all` is dropped rather than sent,
 * so the request URL — and therefore the query cache key — stays minimal.
 */
export async function fetchUsers(params: UserListParams): Promise<UserListResult> {
  const { data } = await api.get<ApiListEnvelope<AdminUser[]>>(BASE, {
    params: {
      page: params.page,
      limit: params.limit,
      ...(params.search ? { search: params.search } : {}),
      ...(params.role !== 'all' ? { role: params.role } : {}),
      ...(params.status !== 'all' ? { status: params.status } : {}),
    },
  })

  return { users: data.data, meta: data.meta }
}

export async function fetchUserStats(): Promise<UserStats> {
  const { data } = await api.get<ApiEnvelope<UserStats>>(`${BASE}/stats`)
  return data.data
}

export interface ChangeRoleInput {
  id: string
  role: UserRole
  /**
   * Required when the role is `Vendor`, and ignored otherwise — the server
   * clears the link on any other role rather than trusting the client to.
   *
   * This is the *only* place in the app that sends a vendor id, and it is an
   * Admin naming a relationship rather than a vendor claiming one. Every read
   * in the Vendor module takes its scope from the profile this writes, never
   * from a request.
   */
  vendorId?: string | null
}

export async function changeUserRole({ id, role, vendorId }: ChangeRoleInput): Promise<AdminUser> {
  const { data } = await api.patch<ApiEnvelope<AdminUser>>(`${BASE}/${id}/role`, {
    role,
    ...(role === 'Vendor' ? { vendorId } : {}),
  })
  return data.data
}

export interface ChangeStatusInput {
  id: string
  status: UserStatus
  note?: string
}

export async function changeUserStatus({
  id,
  status,
  note,
}: ChangeStatusInput): Promise<AdminUser> {
  const { data } = await api.patch<ApiEnvelope<AdminUser>>(`${BASE}/${id}/status`, {
    status,
    ...(note ? { note } : {}),
  })
  return data.data
}

export async function deleteUser(id: string): Promise<{ id: string }> {
  const { data } = await api.delete<ApiEnvelope<{ id: string }>>(`${BASE}/${id}`)
  return data.data
}
