import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { notificationCategoryMeta } from '../lib/notification-meta'
import { NOTIFICATION_CATEGORIES, NOTIFICATION_PRIORITIES } from '../types'
import type {
  NotificationCategory,
  NotificationListParams,
  NotificationPriority,
  NotificationVocabularyEntry,
} from '../types'
import type { NotificationFilterPatch } from '../hooks/use-notification-params'
import { useT } from '@/lib/i18n'

interface NotificationFilterRowProps {
  params: NotificationListParams
  vocabulary: NotificationVocabularyEntry[]
  onChange: (patch: NotificationFilterPatch) => void
}

const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  info: 'notification.priorities.info',
  attention: 'notification.priorities.attention',
  urgent: 'notification.priorities.urgent',
}

/**
 * The three filters behind *More filters*.
 *
 * Here rather than in the toolbar because they are one thing — the narrowing you
 * reach for *after* the obvious cut — and because the toolbar crossed the
 * two-hundred line the project sets as the trigger to extract. Kind, priority and
 * the exact notification, in that order: broadest first, so somebody working
 * left to right narrows rather than backtracks.
 *
 * The **event** select is fed from the server rather than a mirrored list — a
 * hand-copied vocabulary is one chance per value to drift, and a filter that
 * quietly matches nothing is the one failure a message list cannot carry.
 */
export function NotificationFilterRow({
  params,
  vocabulary,
  onChange,
}: NotificationFilterRowProps) {
  const t = useT()

  return (
    <div className="grid gap-2 border-t pt-3 sm:grid-cols-2 lg:grid-cols-3">
      <Select
        value={params.category}
        onValueChange={(value) => onChange({ category: value as NotificationCategory | 'all' })}
      >
        <SelectTrigger className="h-8 w-full" aria-label={t('notification.toolbar.kindAria')}>
          <SelectValue>
            {(value) =>
              value === 'all' || !value
                ? t('notification.toolbar.everyKind')
                : notificationCategoryMeta(value as NotificationCategory, t).label
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">{t('notification.toolbar.everyKind')}</SelectItem>
            {NOTIFICATION_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {notificationCategoryMeta(category, t).label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={params.priority}
        onValueChange={(value) => onChange({ priority: value as NotificationPriority | 'all' })}
      >
        <SelectTrigger className="h-8 w-full" aria-label={t('notification.toolbar.priorityAria')}>
          <SelectValue>
            {(value) =>
              value === 'all' || !value
                ? t('notification.toolbar.anyPriority')
                : PRIORITY_LABELS[value as NotificationPriority]
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">{t('notification.toolbar.anyPriority')}</SelectItem>
            {NOTIFICATION_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={params.event} onValueChange={(value) => onChange({ event: value || 'all' })}>
        <SelectTrigger className="h-8 w-full" aria-label={t('notification.toolbar.eventAria')}>
          <SelectValue>
            {(value) =>
              value === 'all' || !value
                ? t('notification.toolbar.anyNotification')
                : (vocabulary.find((entry) => entry.event === value)?.label ?? t('notification.toolbar.anyNotification'))
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">{t('notification.toolbar.anyNotification')}</SelectItem>
            {vocabulary.map((entry) => (
              <SelectItem key={entry.event} value={entry.event}>
                {entry.label}
                <span className="ml-auto pl-3 text-xs text-muted-foreground">{entry.module}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
