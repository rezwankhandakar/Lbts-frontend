import { api } from '@/lib/axios'
import type { UserProfile } from '@/stores/use-auth-store'

interface ApiEnvelope<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

interface SyncProfileInput {
  name?: string
  photoUrl?: string
}

/**
 * Creates the MongoDB profile on first sign-in and refreshes it afterwards.
 * The role is assigned server-side and is never sent from here.
 */
export async function syncProfile(input: SyncProfileInput = {}): Promise<UserProfile> {
  const { data } = await api.post<ApiEnvelope<UserProfile>>('/users/sync', input)
  return data.data
}

export async function fetchMyProfile(): Promise<UserProfile> {
  const { data } = await api.get<ApiEnvelope<UserProfile>>('/users/me')
  return data.data
}
