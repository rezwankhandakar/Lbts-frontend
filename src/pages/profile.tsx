import { useState } from 'react'
import { RotateCcw, UserRoundX } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { hasPasswordProvider, providerLabels } from '@/features/profile/auth-providers'
import { AccountInformationCard } from '@/features/profile/components/account-information-card'
import { ChangePasswordDialog } from '@/features/profile/components/change-password-dialog'
import { EditProfileDialog } from '@/features/profile/components/edit-profile-dialog'
import { PersonalInformationCard } from '@/features/profile/components/personal-information-card'
import { ProfileHero } from '@/features/profile/components/profile-hero'
import { ProfileSkeleton } from '@/features/profile/components/profile-skeleton'
import { SecurityCard } from '@/features/profile/components/security-card'
import { useProfileView } from '@/features/profile/use-profile'
import { useAuthStore } from '@/stores/use-auth-store'

/**
 * The signed-in user's own account.
 *
 * This is deliberately not a small Administration: it can change a name, a
 * phone number, a photo and a password, and nothing else. Role and account
 * status are shown because someone needs to know what they hold, but they are
 * decided in Administration and enforced by the API on every request — there
 * is no field here that could carry either one, so no request from this page
 * could set them even if the UI were rewritten.
 *
 * Everything renders from the profile already in the auth store, which is
 * filled on every load and never persisted. The two Firebase-owned actions —
 * password and email verification — talk to Firebase directly, because
 * Firebase is what stores those.
 */
export function ProfilePage() {
  const { profile, isLoading, isError, error, retry } = useProfileView()
  const firebaseUser = useAuthStore((state) => state.firebaseUser)

  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader
          title="Profile"
          description="Manage your personal information, account details and security."
        />
        <EmptyState
          icon={UserRoundX}
          title="Your profile could not be loaded"
          description={
            isError
              ? (error?.message ?? 'The server did not answer. It may still be waking up.')
              : 'The server did not answer. It may still be waking up.'
          }
          footnote="A first request after an idle period can take up to a minute."
          action={
            <Button variant="outline" onClick={retry}>
              <RotateCcw data-icon="inline-start" aria-hidden />
              Try again
            </Button>
          }
        />
      </div>
    )
  }

  const canChangePassword = hasPasswordProvider(firebaseUser)
  const providers = providerLabels(firebaseUser)

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Profile"
        description="Manage your personal information, account details and security."
      />

      <ProfileHero profile={profile} onEdit={() => setEditing(true)} />

      {/* Two panels side by side where there is room: what you maintain, and
          what the system maintains about you. They stack in reading order on
          anything narrower. */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <PersonalInformationCard profile={profile} onEdit={() => setEditing(true)} />
        <AccountInformationCard profile={profile} />
      </div>

      <div className="mt-5">
        <SecurityCard
          profile={profile}
          providers={providers}
          canChangePassword={canChangePassword}
          onChangePassword={() => setChangingPassword(true)}
        />
      </div>

      <EditProfileDialog profile={profile} open={editing} onOpenChange={setEditing} />
      <ChangePasswordDialog open={changingPassword} onOpenChange={setChangingPassword} />
    </div>
  )
}
