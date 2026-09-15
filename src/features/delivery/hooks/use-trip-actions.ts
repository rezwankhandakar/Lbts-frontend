import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useAuthStore } from '@/stores/use-auth-store'
import { canChangeTrip } from '../types'
import type { TripRecord } from '../types'
import { useDeleteTrip } from './use-deliveries'

/**
 * Everything a row, a card or the details page can do to a trip, in one place
 * so the three surfaces cannot come to disagree about who may press what.
 *
 * There is no status to move any more: a trip ends when every challan on it
 * has been signed for, and that is recorded on each challan's own delivery
 * page, reached from the trip. Deleting is still confirmed, because it cannot
 * be undone.
 */
export function useTripActions() {
  const navigate = useNavigate()
  const role = useCurrentRole()
  const currentUserId = useAuthStore((state) => state.profile?.id ?? null)
  const [deleting, setDeleting] = useState<TripRecord | null>(null)

  const remove = useDeleteTrip()

  return {
    canChange: (trip: TripRecord) => canChangeTrip(role, currentUserId, trip),
    open: (trip: TripRecord) => navigate(`/delivery/${trip.id}`),
    edit: (trip: TripRecord) => navigate(`/delivery/${trip.id}/edit`),
    askDelete: (trip: TripRecord) => setDeleting(trip),
    deleting,
    isDeleting: remove.isPending,
    cancelDelete: () => setDeleting(null),
    confirmDelete: (onDone?: () => void) => {
      if (!deleting) {
        return
      }
      remove.mutate(deleting.id, {
        onSuccess: () => {
          setDeleting(null)
          onDone?.()
        },
      })
    },
  }
}

export type TripActions = ReturnType<typeof useTripActions>
