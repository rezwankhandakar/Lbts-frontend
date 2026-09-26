import type { TranslationKey } from '@/lib/i18n'

/**
 * Every state the scanner panel can be in, and what the operator is told.
 *
 * The states are separated by what the person has to *do* about them, not by
 * what went wrong technically: "the lid is open" and "the tray is empty" are
 * both a failed transfer to the driver and two entirely different jobs for
 * whoever is standing at the machine.
 *
 * No driver string, HRESULT or file path ever reaches this table. Those are
 * logged by the agent; what appears here is a sentence and, where there is
 * one, the next action.
 */

export type ScannerState =
  /** Nothing has been checked yet. */
  | 'idle'
  | 'checking'
  /** No helper is answering on this machine. */
  | 'agent-missing'
  /** A helper answered, but this browser has not been paired with it. */
  | 'unpaired'
  /** Running on something that cannot scan — a phone, or a Mac. */
  | 'unsupported'
  | 'ready'
  /** The helper is running and no scanner is attached to it. */
  | 'no-device'
  | 'scanning'
  | 'processing'
  | 'completed'
  | 'busy'
  | 'no-paper'
  | 'cover-open'
  | 'paper-jam'
  | 'driver-error'
  | 'network-error'
  | 'failed'

export type ScannerTone = 'neutral' | 'active' | 'good' | 'warning' | 'bad'

export interface ScannerStateCopy {
  tone: ScannerTone
  /** True while the agent is working and the panel should read as busy. */
  busy?: boolean
  /**
   * Which recovery action this failure calls for, when retrying is the right
   * answer at all — and the absence of one is as meaningful as its presence.
   * A key rather than a label, for the reason the titles below are derived.
   */
  retryLabelKey?: TranslationKey
}

/**
 * What each state *is*, with what it says moved to the message tree.
 *
 * The title and description are **derived from the state's own name** —
 * `scanner.states.<state>.title` — rather than stored here, so a state cannot
 * be added without wording, and the two can never drift onto different names.
 * What stays is the part that is not language: the tone, whether the panel
 * reads as busy, and whether there is anything useful to press.
 */
export const SCANNER_STATE_COPY: Record<ScannerState, ScannerStateCopy> = {
  idle: { tone: 'neutral', retryLabelKey: 'scanner.retry.checkScanner' },
  checking: { tone: 'active', busy: true },
  'agent-missing': { tone: 'warning', retryLabelKey: 'scanner.retry.checkAgain' },
  unpaired: { tone: 'warning', retryLabelKey: 'scanner.retry.connectScanner' },
  unsupported: { tone: 'neutral' },
  ready: { tone: 'good' },
  'no-device': { tone: 'warning', retryLabelKey: 'scanner.retry.tryAgain' },
  scanning: { tone: 'active', busy: true },
  processing: { tone: 'active', busy: true },
  completed: { tone: 'good' },
  busy: { tone: 'warning', retryLabelKey: 'scanner.retry.tryAgain' },
  'no-paper': { tone: 'warning', retryLabelKey: 'scanner.retry.tryAgain' },
  'cover-open': { tone: 'warning', retryLabelKey: 'scanner.retry.tryAgain' },
  'paper-jam': { tone: 'bad', retryLabelKey: 'scanner.retry.tryAgain' },
  'driver-error': { tone: 'bad', retryLabelKey: 'scanner.retry.tryAgain' },
  'network-error': { tone: 'bad', retryLabelKey: 'scanner.retry.checkAgain' },
  failed: { tone: 'bad', retryLabelKey: 'scanner.retry.tryAgain' },
}

/** Where a state's own wording lives. The state name is the key. */
export function scannerTitleKey(state: ScannerState): TranslationKey {
  return `scanner.states.${state}.title` as TranslationKey
}

export function scannerDescriptionKey(state: ScannerState): TranslationKey {
  return `scanner.states.${state}.description` as TranslationKey
}

/**
 * Full literal class strings, because Tailwind scans source text — the same
 * rule as `layout/nav-accents.ts` and `lib/roles.ts`.
 */
export const SCANNER_TONES: Record<ScannerTone, { dot: string; chip: string; text: string }> = {
  neutral: {
    dot: 'bg-muted-foreground',
    chip: 'bg-muted text-muted-foreground ring-border',
    text: 'text-muted-foreground',
  },
  active: {
    dot: 'bg-tone-indigo',
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
    text: 'text-tone-indigo',
  },
  good: {
    dot: 'bg-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
    text: 'text-tone-emerald',
  },
  warning: {
    dot: 'bg-tone-amber',
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    text: 'text-tone-amber',
  },
  bad: {
    dot: 'bg-tone-rose',
    chip: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
    text: 'text-tone-rose',
  },
}
