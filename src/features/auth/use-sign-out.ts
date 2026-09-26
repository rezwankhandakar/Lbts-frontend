import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { t } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
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
      /*
       * The standalone `t` rather than the hook: this is a callback that
       * produces a string and hands it straight to a toast, so there is
       * nothing rendering that would need to re-render. See `use-t.ts`.
       */
      toast.success(t('auth.signOutSuccess'))
      navigate('/sign-in', { replace: true })
    } catch (error) {
      toast.error(t(toAuthMessage(error) as TranslationKey))
    }
  }, [logout, navigate])
}
