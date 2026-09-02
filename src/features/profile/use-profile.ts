import { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchMyProfile } from '@/features/auth/auth-api'
import type { ApiError } from '@/lib/axios'
import { useAuthStore } from '@/stores/use-auth-store'
import type { UserProfile } from '@/stores/use-auth-store'
import { removeProfilePhoto, updateProfile, uploadProfilePhoto } from './profile-api'
import type { UpdateProfileInput } from './profile-api'

export const profileKeys = {
  me: () => ['profile', 'me'] as const,
}

/**
 * The generic top-level message ("Validation failed.") tells the user nothing,
 * so where the API itemised what was wrong the first entry is shown beneath
 * it. Same treatment the administration module gives its errors.
 */
function reportError(error: ApiError): void {
  const detail = error.errorSources.find(
    (source) => source.message && source.message !== error.message,
  )

  toast.error(error.message, { description: detail?.message })
}

export interface ProfileView {
  profile: UserProfile | null
  isLoading: boolean
  isError: boolean
  error: ApiError | null
  retry: () => void
}

/**
 * The profile the page renders.
 *
 * It normally comes from the auth store, which the session listener fills on
 * every load — so there is no second request and nothing to wait for. The
 * query exists only for the case where that sync failed: a cold Render
 * instance timing out leaves an authenticated user with no profile, and
 * without this the page would sit on a skeleton forever with no way back.
 */
export function useProfileView(): ProfileView {
  const profile = useAuthStore((state) => state.profile)
  const setProfile = useAuthStore((state) => state.setProfile)

  // The error type is declared, not inferred: the axios interceptor rejects
  // with ApiError, which TanStack cannot know from the query function alone.
  const query = useQuery<UserProfile, ApiError>({
    queryKey: profileKeys.me(),
    queryFn: fetchMyProfile,
    enabled: profile === null,
    // A cold backend can take most of a minute to answer the first request.
    retry: 2,
    staleTime: 0,
  })

  useEffect(() => {
    if (query.data) {
      setProfile(query.data)
    }
  }, [query.data, setProfile])

  const retry = useCallback(() => {
    void query.refetch()
  }, [query])

  return {
    profile,
    isLoading: profile === null && query.isPending,
    isError: profile === null && query.isError,
    error: query.error,
    retry,
  }
}

/**
 * Writes the refreshed profile straight into the auth store. Every surface
 * that shows the user — the header menu, the sidebar card, this page — reads
 * from there, so one write updates all of them at once and none of them needs
 * to know a mutation happened.
 */
function useProfileWriter() {
  const setProfile = useAuthStore((state) => state.setProfile)

  return useCallback(
    (profile: UserProfile, message: string) => {
      setProfile(profile)
      toast.success(message)
    },
    [setProfile],
  )
}

export function useUpdateProfile(): UseMutationResult<UserProfile, ApiError, UpdateProfileInput> {
  const write = useProfileWriter()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => write(profile, 'Profile updated'),
    onError: reportError,
  })
}

export interface PhotoUploadController {
  upload: (file: File) => Promise<void>
  isUploading: boolean
  /** 0-100 while bytes are in flight, null when idle. */
  progress: number | null
}

export function useUploadProfilePhoto(onUploaded?: () => void): PhotoUploadController {
  const write = useProfileWriter()
  const [progress, setProgress] = useState<number | null>(null)

  const mutation = useMutation({
    mutationFn: (file: File) => uploadProfilePhoto(file, setProgress),
    onSuccess: (profile) => {
      write(profile, 'Profile photo updated')
      onUploaded?.()
    },
    onError: reportError,
    onSettled: () => setProgress(null),
  })

  const upload = useCallback(
    async (file: File) => {
      setProgress(0)
      // The mutation reports its own failure through onError; awaiting the
      // rejection here as well would surface it twice.
      await mutation.mutateAsync(file).catch(() => undefined)
    },
    [mutation],
  )

  return { upload, isUploading: mutation.isPending, progress }
}

export function useRemoveProfilePhoto(): UseMutationResult<UserProfile, ApiError, void> {
  const write = useProfileWriter()

  return useMutation({
    mutationFn: removeProfilePhoto,
    onSuccess: (profile) => write(profile, 'Profile photo removed'),
    onError: reportError,
  })
}
