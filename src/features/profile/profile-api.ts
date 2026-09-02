import { api } from '@/lib/axios'
import type { UserProfile } from '@/stores/use-auth-store'

interface ApiEnvelope<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

const BASE = '/profile'

export interface UpdateProfileInput {
  name: string
  /** Empty string clears the number; the API turns that into null. */
  phone: string
}

/**
 * Every call here operates on the authenticated user, and only on them. No
 * function takes a user id: the API derives the account from the verified
 * Firebase ID token the axios interceptor attaches, so there is nothing a
 * caller could pass to reach somebody else's profile.
 *
 * Each returns the refreshed profile, which is what keeps the auth store in
 * step without a follow-up read.
 */
export async function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  const { data } = await api.patch<ApiEnvelope<UserProfile>>(BASE, input)
  return data.data
}

export async function uploadProfilePhoto(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UserProfile> {
  const formData = new FormData()
  formData.append('photo', file)

  const { data } = await api.post<ApiEnvelope<UserProfile>>(`${BASE}/photo`, formData, {
    /**
     * The shared instance defaults to application/json, and axios reads that
     * default before the adapter runs: left in place it would serialise the
     * FormData to JSON and the upload would arrive with no file at all.
     * Naming multipart here defeats that, and the browser still replaces this
     * value with one carrying the real boundary.
     */
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) {
        return
      }
      // Held just below 100 until the response lands: the bytes being sent is
      // not the same as the server having stored them.
      onProgress(Math.min(99, Math.round((event.loaded * 100) / event.total)))
    },
  })

  return data.data
}

export async function removeProfilePhoto(): Promise<UserProfile> {
  const { data } = await api.delete<ApiEnvelope<UserProfile>>(`${BASE}/photo`)
  return data.data
}
