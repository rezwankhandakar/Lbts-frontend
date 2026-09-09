import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import {
  changeUserRole,
  changeUserStatus,
  deleteUser,
  fetchUsers,
  fetchUserStats,
} from './administration-api'
import type { ChangeRoleInput, ChangeStatusInput } from './administration-api'
import type { AdminUser, UserListParams, UserListResult, UserStats } from './types'

export const administrationKeys = {
  all: ['administration'] as const,
  users: (params: UserListParams) => ['administration', 'users', params] as const,
  stats: () => ['administration', 'stats'] as const,
}

/**
 * Shorter than the app-wide 5-minute staleTime: an Admin working through a
 * queue of pending accounts expects the list to reflect their own decisions.
 * Still long enough that paging back and forth is free.
 */
const LIST_STALE_TIME = 30_000

export function useAdminUsers(params: UserListParams): UseQueryResult<UserListResult, ApiError> {
  return useQuery({
    queryKey: administrationKeys.users(params),
    queryFn: () => fetchUsers(params),
    staleTime: LIST_STALE_TIME,
    // Keeps the previous page on screen while the next one loads, so paging
    // and filtering never blank the table.
    placeholderData: keepPreviousData,
    // A cold Render instance can take most of a minute to wake up.
    retry: 2,
  })
}

export function useAdminUserStats(): UseQueryResult<UserStats, ApiError> {
  return useQuery({
    queryKey: administrationKeys.stats(),
    queryFn: fetchUserStats,
    staleTime: LIST_STALE_TIME,
    retry: 2,
  })
}

/**
 * Every mutation invalidates the whole administration namespace: a role or
 * status change moves a row between filtered views and shifts the overview
 * counts, so refetching just one key would leave the page inconsistent.
 */
function useInvalidateAdministration() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: administrationKeys.all })
}

/**
 * The top-level message is deliberately generic for a validation failure
 * ("Validation failed."), which tells an operator nothing. Where the API
 * itemised what was wrong, the first entry is shown underneath — that is the
 * part naming the field that actually refused.
 */
function reportError(error: ApiError): void {
  const detail = error.errorSources.find(
    (source) => source.message && source.message !== error.message,
  )

  toast.error(error.message, {
    description: detail
      ? detail.path
        ? `${detail.path}: ${detail.message}`
        : detail.message
      : undefined,
  })
}

export function useChangeUserRole(): UseMutationResult<
  AdminUser,
  ApiError,
  ChangeRoleInput & { name: string }
> {
  const invalidate = useInvalidateAdministration()

  return useMutation({
    mutationFn: ({ id, role, vendorId }) => changeUserRole({ id, role, vendorId }),
    onSuccess: (user, variables) => {
      /**
       * A Vendor account is only half a decision without the vendor it speaks
       * for, so the toast names it. Without that an Admin has no confirmation
       * that the link they chose is the one that landed — and the link is the
       * whole of what that account will be able to see.
       */
      toast.success(`${variables.name} is now ${user.role}`, {
        description: user.vendor
          ? `Linked to ${user.vendor.name} (${user.vendor.vendorCode}). They will see that vendor's fleet, read-only.`
          : undefined,
      })
      void invalidate()
    },
    onError: reportError,
  })
}

export function useChangeUserStatus(): UseMutationResult<
  AdminUser,
  ApiError,
  ChangeStatusInput & { name: string; successMessage: string }
> {
  const invalidate = useInvalidateAdministration()

  return useMutation({
    mutationFn: ({ id, status, note }) => changeUserStatus({ id, status, note }),
    onSuccess: (_user, variables) => {
      toast.success(variables.successMessage)
      void invalidate()
    },
    onError: reportError,
  })
}

export function useDeleteUser(): UseMutationResult<
  { id: string },
  ApiError,
  { id: string; name: string }
> {
  const invalidate = useInvalidateAdministration()

  return useMutation({
    mutationFn: ({ id }) => deleteUser(id),
    onSuccess: (_result, variables) => {
      toast.success(`${variables.name}'s account was deleted`)
      void invalidate()
    },
    onError: reportError,
  })
}
