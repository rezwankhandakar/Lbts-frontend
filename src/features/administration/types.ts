import type { UserRole, UserStatus } from '@/lib/roles'

/** Who last changed a role or a status, as the API resolves it. */
export interface ActorRef {
  id: string
  name: string
}

/**
 * A user as the administration API returns it. Superset of the signed-in
 * user's own profile: it carries the lifecycle metadata the details panel
 * needs, which is why opening a user costs no extra request.
 */
export interface AdminUser {
  id: string
  firebaseUid: string
  email: string
  name: string
  phone: string | null
  photoUrl: string | null
  emailVerified: boolean
  role: UserRole
  status: UserStatus
  createdAt: string
  lastLoginAt: string | null
  roleUpdatedAt: string | null
  roleUpdatedBy: ActorRef | null
  statusUpdatedAt: string | null
  statusUpdatedBy: ActorRef | null
  statusNote: string | null
}

export interface UserStats {
  total: number
  pending: number
  active: number
  rejected: number
  suspended: number
}

export type RoleFilter = UserRole | 'all'
export type StatusFilter = UserStatus | 'all'

export interface UserListParams {
  page: number
  limit: number
  search: string
  role: RoleFilter
  status: StatusFilter
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface UserListResult {
  users: AdminUser[]
  meta: PageMeta
}
