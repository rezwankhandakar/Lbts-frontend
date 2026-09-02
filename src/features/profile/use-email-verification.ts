import { useCallback, useEffect, useState } from 'react'
import { sendEmailVerification } from 'firebase/auth'
import { toast } from 'sonner'
import { syncProfile } from '@/features/auth/auth-api'
import { toAuthMessage } from '@/features/auth/firebase-errors'
import { firebaseAuth } from '@/lib/firebase'
import { useAuthStore } from '@/stores/use-auth-store'

/**
 * Long enough that nobody hammers the button while waiting for an email that
 * is already on its way, short enough that a genuinely lost message is not a
 * punishment. Firebase rate-limits this itself; the cooldown is what keeps the
 * user from ever meeting that limit.
 */
const COOLDOWN_SECONDS = 60

export interface EmailVerificationController {
  resend: () => Promise<void>
  isSending: boolean
  /** Seconds until the button is usable again; 0 when it is available. */
  cooldown: number
}

/**
 * Email verification belongs to Firebase — it sends the message, it owns the
 * link, and it flips the flag. MongoDB only mirrors the result, which it picks
 * up on the next profile sync.
 *
 * That mirroring is why this checks before it sends: someone who has just
 * followed the link in another tab is already verified in Firebase while the
 * profile on screen still says otherwise. Reloading first turns "resend" into
 * "refresh" for exactly that case, instead of sending a pointless second
 * email and leaving the page still looking wrong.
 */
export function useEmailVerification(): EmailVerificationController {
  const setProfile = useAuthStore((state) => state.setProfile)
  const [isSending, setIsSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) {
      return
    }

    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [cooldown])

  const resend = useCallback(async () => {
    const user = firebaseAuth.currentUser

    if (!user) {
      toast.error('Your session has expired. Sign in again.')
      return
    }

    setIsSending(true)

    try {
      await user.reload()

      if (user.emailVerified) {
        /**
         * Force a token refresh so the API sees the new claim, then re-sync so
         * MongoDB's copy — and every badge reading from it — catches up.
         */
        await user.getIdToken(true)
        setProfile(await syncProfile())
        toast.success('Your email is verified', {
          description: 'Thanks for confirming — your account details are up to date.',
        })
        return
      }

      await sendEmailVerification(user)
      setCooldown(COOLDOWN_SECONDS)
      toast.success('Verification email sent', {
        description: `Open the link we sent to ${user.email}.`,
      })
    } catch (error) {
      toast.error(toAuthMessage(error))
    } finally {
      setIsSending(false)
    }
  }, [setProfile])

  return { resend, isSending, cooldown }
}
