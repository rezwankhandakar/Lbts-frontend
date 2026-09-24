import {
  AlertTriangle,
  Banknote,
  BellRing,
  Building2,
  CheckCheck,
  Info,
  Landmark,
  PackageCheck,
  Receipt,
  ScanLine,
  ShieldCheck,
  Truck,
  UserCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { daysAgo } from '@/lib/day-grouping'
import type {
  NotificationCategory,
  NotificationModule,
  NotificationPriority,
  NotificationRecord,
} from '../types'

/**
 * How a message reads on screen.
 *
 * Three vocabularies drawn from three places, and keeping them apart is the
 * point — the arrangement `activity-meta.ts` states and this deliberately
 * matches, because the two lists sit in the same shell and a reader should not
 * have to learn a second colour language:
 *
 * - **Module** carries the colour, and it is the *same* colour the sidebar gives
 *   that destination. Somebody who has learnt that Challan is violet should not
 *   have to learn a second palette to read their notifications.
 * - **Category** carries the icon, because what *kind* of message it is — a
 *   decision waiting, paper that has lapsed, money — is what somebody scanning a
 *   list is matching on.
 * - **Priority** carries the emphasis, and only `urgent` and `attention` get
 *   any. A list where everything is highlighted is a list where nothing is.
 *
 * Every class is a full literal string. Tailwind scans source text, so a
 * template like `text-tone-${tone}` generates nothing and the colour silently
 * vanishes — the rule `lib/roles.ts` and `layout/nav-accents.ts` both state.
 */

interface ModuleMeta {
  label: string
  icon: LucideIcon
  /** Soft tinted pill: background, hairline border and text in one hue. */
  badge: string
  /** Icon chip, for the marker beside the message. */
  chip: string
  dot: string
}

export const NOTIFICATION_MODULE_META: Record<NotificationModule, ModuleMeta> = {
  Account: {
    label: 'Account',
    icon: ShieldCheck,
    badge: 'border-tone-violet/25 bg-tone-violet/10 text-tone-violet',
    chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
    dot: 'bg-tone-violet',
  },
  'Gate Pass': {
    label: 'Gate Pass',
    icon: ScanLine,
    badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
    dot: 'bg-tone-cyan',
  },
  Delivery: {
    label: 'Delivery',
    icon: PackageCheck,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    dot: 'bg-tone-amber',
  },
  Vendor: {
    label: 'Vendor',
    icon: Building2,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
    dot: 'bg-tone-emerald',
  },
  Billing: {
    label: 'Billing',
    icon: Receipt,
    badge: 'border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo',
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
    dot: 'bg-tone-indigo',
  },
  Accounts: {
    label: 'Accounts',
    icon: Landmark,
    badge: 'border-tone-violet/25 bg-tone-violet/10 text-tone-violet',
    chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
    dot: 'bg-tone-violet',
  },
}

const UNKNOWN_MODULE: ModuleMeta = {
  label: 'System',
  icon: BellRing,
  badge: 'border-border bg-muted text-muted-foreground',
  chip: 'bg-muted text-muted-foreground ring-border',
  dot: 'bg-muted-foreground',
}

/**
 * Degrades rather than throwing, for the reason the server's own
 * `notificationEventMeta` does: the event is a plain string on the document so a
 * retired one never makes an unread message unreadable, and that only holds if
 * every layer between the collection and the screen reads it safely.
 */
export function notificationModuleMeta(value: string): ModuleMeta {
  return NOTIFICATION_MODULE_META[value as NotificationModule] ?? UNKNOWN_MODULE
}

interface CategoryMeta {
  label: string
  icon: LucideIcon
  /** The sentence on the preferences page, which has to say what goes quiet. */
  description: string
}

export const NOTIFICATION_CATEGORY_META: Record<NotificationCategory, CategoryMeta> = {
  approvals: {
    label: 'Approvals',
    icon: UserCheck,
    description: 'Accounts waiting for someone to approve them and assign a role.',
  },
  review: {
    label: 'Review',
    icon: CheckCheck,
    description: 'Gate passes submitted for checking, verified, or sent back.',
  },
  compliance: {
    label: 'Compliance',
    icon: AlertTriangle,
    description: 'Certificates about to lapse, and deliveries closed with no signed copy.',
  },
  operations: {
    label: 'Operations',
    icon: Truck,
    description: 'Goods back at the depot, and other facts about the day’s trips.',
  },
  money: {
    label: 'Money',
    icon: Banknote,
    description: 'Bills signed off, and payments recorded against a vendor.',
  },
  account: {
    label: 'Your account',
    icon: ShieldCheck,
    description:
      'Your own role and account status. This one cannot be switched off — an account that stops working without a word is worse than an interruption.',
  },
}

export function notificationCategoryMeta(value: string): CategoryMeta {
  return NOTIFICATION_CATEGORY_META[value as NotificationCategory] ?? NOTIFICATION_CATEGORY_META.operations
}

interface PriorityMeta {
  label: string
  /** A hairline down the row's leading edge. Only the two that earn it. */
  emphasis: string | null
  /** The dot on the bell, and the tile. */
  dot: string
  badge: string
  icon: LucideIcon
}

export const NOTIFICATION_PRIORITY_META: Record<NotificationPriority, PriorityMeta> = {
  info: {
    label: 'For information',
    emphasis: null,
    dot: 'bg-brand-indigo',
    badge: 'border-border bg-muted text-muted-foreground',
    icon: Info,
  },
  attention: {
    label: 'Needs attention',
    emphasis: 'bg-tone-amber',
    dot: 'bg-brand-amber',
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    icon: AlertTriangle,
  },
  urgent: {
    label: 'Urgent',
    emphasis: 'bg-tone-rose',
    dot: 'bg-tone-rose',
    badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
    icon: AlertTriangle,
  },
}

export function notificationPriorityMeta(value: string): PriorityMeta {
  return NOTIFICATION_PRIORITY_META[value as NotificationPriority] ?? NOTIFICATION_PRIORITY_META.info
}

/**
 * Where a message's record lives — **derived here, never stored.**
 *
 * A path is a fact about this router rather than about the message, so a URL
 * written into the collection in June is one that silently breaks when a route is
 * renamed in September, in every row at once. It is the arrangement `recordPath`
 * has in the activity feature, and it follows the same rule about honesty:
 *
 * **A link is offered only where the id genuinely *is* the URL.** A vehicle lives
 * inside a vendor's tab and a compliance document inside that, so neither has a
 * route of its own — on a page somebody uses to act on what they are told, a link
 * that lands in the wrong place undermines the one thing it is for. Those rows
 * say what happened and let the reader go and find it.
 *
 * A record that has since been deleted keeps its message and loses its link,
 * which is correct — the label is a copy precisely so the sentence survives.
 */
export function notificationPath(record: NotificationRecord): string | null {
  if (!record.entityId) {
    return null
  }

  switch (record.entityType) {
    case 'GatePass':
      return `/gate-pass/${record.entityId}`
    case 'Challan':
      return `/challan/${record.entityId}`
    case 'Trip':
      return `/delivery/${record.entityId}`
    case 'Vendor':
      return `/vendors/${record.entityId}`
    case 'Bill':
      return `/bills/${record.entityId}`
    case 'LabourBill':
      return `/labour-bills/${record.entityId}`
    /**
     * Administration is a list rather than a page per account, so a message about
     * an account waiting for approval lands on the list — which is where the
     * decision is actually taken. `/profile` would be wrong for the same message
     * seen by an Admin, and right only for the one about your own role, which
     * needs no link at all: the sidebar it changed is already on screen.
     */
    case 'User':
      return record.event === 'account.pending' ? '/administration' : null
    /**
     * An entry lives in a filtered cash book rather than at an id, and a voucher
     * is opened from the row. Naming the page is honest; naming a row that may be
     * three pages back is not.
     */
    case 'AccountsEntry':
      return '/accounts/cash-book'
    default:
      return null
  }
}

/** What the link is called, so a button says where it goes. */
export function notificationLinkLabel(record: NotificationRecord): string {
  switch (record.entityType) {
    case 'GatePass':
      return 'Open gate pass'
    case 'Challan':
      return 'Open challan'
    case 'Trip':
      return 'Open trip'
    case 'Vendor':
      return 'Open vendor'
    case 'Bill':
    case 'LabourBill':
      return 'Open bill'
    case 'User':
      return 'Open Administration'
    case 'AccountsEntry':
      return 'Open cash book'
    default:
      return 'Open'
  }
}

const DAY_HEADING = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** "Today", "Yesterday", then the full date — the question the reader is asking. */
export function dayHeading(iso: string): string {
  const days = daysAgo(iso, new Date())

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return DAY_HEADING.format(new Date(iso))
}

/**
 * The arithmetic lives in `@/lib/day-grouping` and is re-exported here, so
 * callers import presentation from one place while the alias-free file owns the
 * value and stays loadable by `node --test`. It moved out of the activity
 * feature when this list wanted the same day headings — a move rather than a
 * copy, as CLAUDE.md asks.
 */
export { actorInitials, dayKeyOf, groupByDay } from '@/lib/day-grouping'
