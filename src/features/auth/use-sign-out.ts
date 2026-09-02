import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { toAuthMessage } from './firebase-errors'
import { useAuthActions } from './use-auth'

/**
 * Shared sign-out handler. The sidebar button and the header menu both call
 * this, so the two entry points cannot drift apart. Wraps the existing
 * `logout` action — it does not introduce a second mechanism.
 */
export function useSignOut(): () => Promise<void> {
  const navigate = useNavigate()
  const { logout } = useAuthActions()

  return useCallback(async () => {
    try {
      await logout()
      toast.success('Signed out')
      navigate('/sign-in', { replace: true })
    } catch (error) {
      toast.error(toAuthMessage(error))
    }
  }, [logout, navigate])
}
