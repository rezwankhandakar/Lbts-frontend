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
  title: string
  description: string
  tone: ScannerTone
  /** True while the agent is working and the panel should read as busy. */
  busy?: boolean
  /** Label for the recovery action, when retrying is the right answer. */
  retryLabel?: string
}

export const SCANNER_STATE_COPY: Record<ScannerState, ScannerStateCopy> = {
  idle: {
    title: 'Scanner not checked',
    description: 'Check whether a scanner is available on this computer.',
    tone: 'neutral',
    retryLabel: 'Check scanner',
  },
  checking: {
    title: 'Checking for a scanner',
    description: 'Looking for the LBTS scanner helper on this computer.',
    tone: 'active',
    busy: true,
  },
  'agent-missing': {
    title: 'Scanner helper not running',
    description:
      'Scanning needs the LBTS Scanner Agent running on this computer. Start it, then check again. You can still attach a scan from a file.',
    tone: 'warning',
    retryLabel: 'Check again',
  },
  unpaired: {
    title: 'Scanner not connected',
    description:
      'The scanner helper is running but this browser has not been paired with it yet. Connect it with the pairing code the helper printed.',
    tone: 'warning',
    retryLabel: 'Connect scanner',
  },
  unsupported: {
    title: 'Scanning is not available here',
    description:
      'The scanner helper runs on the Windows computer the scanner is connected to. Attach a scan from a file instead.',
    tone: 'neutral',
  },
  ready: {
    title: 'Scanner ready',
    description: 'Place the gate pass on the glass or in the feeder, then start the scan.',
    tone: 'good',
  },
  'no-device': {
    title: 'No scanner detected',
    description:
      'The helper is running but found no scanner. Check that the scanner is switched on and on the same network, then try again.',
    tone: 'warning',
    retryLabel: 'Try again',
  },
  scanning: {
    title: 'Scanning',
    description: 'Capturing the page. Do not open the lid or remove the paper.',
    tone: 'active',
    busy: true,
  },
  processing: {
    title: 'Preparing the document',
    description: 'Assembling the scanned pages.',
    tone: 'active',
    busy: true,
  },
  completed: {
    title: 'Scan complete',
    description: 'Check that the whole gate pass is readable before you submit.',
    tone: 'good',
  },
  busy: {
    title: 'Scanner busy',
    description: 'The scanner is working on another job. Wait for it to finish, then try again.',
    tone: 'warning',
    retryLabel: 'Try again',
  },
  'no-paper': {
    title: 'No paper detected',
    description: 'The document feeder is empty. Load the gate pass and start the scan again.',
    tone: 'warning',
    retryLabel: 'Try again',
  },
  'cover-open': {
    title: 'Scanner cover is open',
    description: 'Close the scanner lid, then start the scan again.',
    tone: 'warning',
    retryLabel: 'Try again',
  },
  'paper-jam': {
    title: 'Paper jam',
    description: 'Clear the jam at the scanner, then start the scan again.',
    tone: 'bad',
    retryLabel: 'Try again',
  },
  'driver-error': {
    title: 'The scanner did not respond',
    description:
      'The scanner driver stopped answering. Restarting the scanner usually clears it. You can also attach a scan from a file.',
    tone: 'bad',
    retryLabel: 'Try again',
  },
  'network-error': {
    title: 'Lost contact with the scanner helper',
    description: 'The helper stopped answering. Check that it is still running on this computer.',
    tone: 'bad',
    retryLabel: 'Check again',
  },
  failed: {
    title: 'The scan did not complete',
    description: 'Nothing was captured. Try again, or attach a scan from a file.',
    tone: 'bad',
    retryLabel: 'Try again',
  },
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
