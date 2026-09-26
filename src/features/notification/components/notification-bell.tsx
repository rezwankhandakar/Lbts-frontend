import { useState } from 'react'
import { Bell } from 'lucide-react'
import { HEADER_ICON_BUTTON } from '@/components/layout/header-styles'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useNotificationSummary } from '../hooks/use-notifications'
import { NotificationPanel } from './notification-panel'
import { NotificationPreferencesDialog } from './notification-preferences-dialog'

/**
 * The bell in the header, and the one thing on screen that is always watching.
 *
 * It replaced a hard-coded `UNREAD_NOTIFICATIONS = 3` and a dot that was always
 * lit — which is worth recording, because an always-lit badge is exactly the
 * failure mode a notification system has to avoid, and the placeholder was a
 * small demonstration of it.
 *
 * Three decisions about how it draws:
 *
 * - **A count, not a dot, once there is anything.** "3" is actionable and a dot
 *   is a puzzle. Past nine it reads `9+`: the precise number stops mattering
 *   long before that, and four digits in a 16px circle is a smudge.
 * - **The colour comes from the highest priority waiting**, so an expired
 *   certificate and three filed bills do not look the same. Rose for urgent,
 *   amber for attention, brand indigo for information — the same tones the rows
 *   use, so the badge is a promise the panel keeps.
 * - **Nothing at zero.** No grey dot, no hollow ring. An empty badge is a thing
 *   to check; nothing is nothing.
 *
 * The count is also in the button's accessible name rather than only in the
 * badge, because a screen reader gets no colour and no position — and it is
 * announced as a live region inside the panel too, for the poll that arrives
 * while somebody is reading.
 */
export function NotificationBell() {
  const t = useT()

  const [open, setOpen] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  const summary = useNotificationSummary()
  const unread = summary.data?.unread ?? 0
  const byPriority = summary.data?.byPriority

  const tone =
    byPriority && byPriority.urgent > 0
      ? 'bg-tone-rose text-white'
      : byPriority && byPriority.attention > 0
        ? 'bg-brand-amber text-white'
        : 'bg-primary text-primary-foreground'

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className={cn(HEADER_ICON_BUTTON, 'relative')}
              aria-label={
                unread === 0
                  ? t('notification.bellNothing')
                  : `Notifications, ${unread} unread`
              }
            />
          }
        >
          <Bell aria-hidden />

          {unread > 0 && (
            <span
              className={cn(
                'absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold tabular-nums ring-2 ring-background',
                tone,
              )}
              aria-hidden
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </PopoverTrigger>

        <PopoverContent align="end" sideOffset={10} className="overflow-hidden p-0">
          <NotificationPanel
            summary={summary.data}
            isLoading={summary.isPending}
            isError={summary.isError}
            errorMessage={summary.error?.message ?? t('errors.generic')}
            onRetry={() => void summary.refetch()}
            onClose={() => setOpen(false)}
            onOpenPreferences={() => setPreferencesOpen(true)}
          />
        </PopoverContent>
      </Popover>

      {/**
       * Outside the popover on purpose. A dialog rendered inside a popup dies
       * with it the moment the popover closes — and the popover has to close,
       * because two layers of overlay stacked on a phone is a dialog nobody can
       * reach the bottom of.
       */}
      <NotificationPreferencesDialog open={preferencesOpen} onOpenChange={setPreferencesOpen} />
    </>
  )
}
