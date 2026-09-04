import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ScannerAgentError,
  createHttpScannerAgent,
  getScannerToken,
} from '../lib/scanner-agent'
import type {
  ScanColorMode,
  ScanResolution,
  ScanSource,
  ScannedDocument,
  ScannerDevice,
} from '../lib/scanner-agent'
import type { ScannerState } from '../lib/scanner-messages'

/**
 * Owns the conversation with the local scanner agent.
 *
 * Everything the panel renders comes from here: which state the scanner is in,
 * which devices exist, how many pages have come through, and the file at the
 * end. The panel itself makes no requests and knows no failure codes.
 *
 * A scan is a job the agent runs and this polls, rather than one long request.
 * That is what lets a feeder scan report page 3 of 5 while it is still moving,
 * and what lets Cancel mean something.
 */

/** Fast enough to feel live, slow enough not to hammer a busy workstation. */
const POLL_INTERVAL_MS = 1200

export interface ScannerSettings {
  deviceId: string
  source: ScanSource
  resolution: ScanResolution
  colorMode: ScanColorMode
}

/**
 * What a gate pass is scanned at unless the operator says otherwise.
 *
 * 200 dpi black and white, because a challan is black toner on white paper:
 * the colour channels carry nothing, and thresholding is what makes the
 * printed text crisp rather than grey. It is also by far the smallest file —
 * which matters twice over on this stack, once for the upload from a desk in
 * Dhaka and once for the R2 free tier holding it.
 *
 * Colour and 300/600 dpi are one dropdown away for the challan that needs
 * them: a faint carbon copy, or a stamp that has to stay legible.
 */
const DEFAULT_SETTINGS: ScannerSettings = {
  deviceId: '',
  source: 'flatbed',
  resolution: 200,
  colorMode: 'blackwhite',
}

export interface ScannerController {
  state: ScannerState
  devices: ScannerDevice[]
  /** The device the next scan will use, resolved from settings or the first found. */
  activeDevice: ScannerDevice | null
  settings: ScannerSettings
  setSettings: (next: Partial<ScannerSettings>) => void
  /** Pages transferred so far, while a feeder scan is running. */
  pages: number
  check: () => void
  scan: () => void
  cancel: () => void
  /** Clears a finished or failed scan back to ready, without touching hardware. */
  reset: () => void
  /**
   * The last multi-page scan taken as one file instead of several.
   *
   * The sheets are already on the agent, so changing your mind about what a
   * stack was costs a re-read rather than a re-scan. Null when the last job
   * had a single page, or is no longer held.
   */
  combineLast: () => Promise<ScannedDocument | null>
}

interface UseScannerOptions {
  /**
   * Called once when a scan completes, with what came off the scanner.
   *
   * Several documents when the sheets are separate gate passes, one when they
   * are a single gate pass spanning several sheets. Which of the two is
   * decided by `separatePages`, because only the operator knows.
   */
  onScanned: (documents: ScannedDocument[]) => void
  /**
   * True to take a multi-sheet scan as one document per sheet. The default,
   * because a stack in the feeder is usually a stack of gate passes.
   */
  separatePages?: boolean
}

function stateForAgentError(error: unknown): ScannerState {
  if (error instanceof ScannerAgentError) {
    if (error.failure === 'unreachable') {
      return 'agent-missing'
    }
    if (error.failure === 'unauthorized') {
      return 'unpaired'
    }
  }
  return 'network-error'
}

/** What one probe of the workstation found. */
interface ProbeOutcome {
  state: ScannerState
  devices: ScannerDevice[]
}

/**
 * Asks the workstation what it can scan with.
 *
 * Deliberately a plain function rather than part of the hook: it touches no
 * React state, so the effect below can apply its result in a callback instead
 * of updating state as it runs. Two steps, two failures — a missing helper and
 * a missing scanner need different words in front of the operator.
 */
async function probeScanner(agent: ReturnType<typeof createHttpScannerAgent>): Promise<ProbeOutcome> {
  try {
    const health = await agent.probe()

    if (!health.scanningAvailable) {
      return { state: 'unsupported', devices: [] }
    }

    if (!getScannerToken()) {
      return { state: 'unpaired', devices: [] }
    }

    const devices = await agent.listDevices()
    return { state: devices.length > 0 ? 'ready' : 'no-device', devices }
  } catch (error) {
    return { state: stateForAgentError(error), devices: [] }
  }
}

/** The agent's failure reason, in the words the panel has for it. */
const FAILURE_STATES: Record<string, ScannerState> = {
  'no-device': 'no-device',
  busy: 'busy',
  'no-paper': 'no-paper',
  'cover-open': 'cover-open',
  'paper-jam': 'paper-jam',
  'driver-error': 'driver-error',
}

export function useScanner({
  onScanned,
  separatePages = true,
}: UseScannerOptions): ScannerController {
  const agent = useMemo(() => createHttpScannerAgent(), [])

  // Starts at `checking`, because the hook probes for a helper as it mounts.
  // Naming that in the initial state is what keeps the mount effect from
  // having to set it synchronously.
  const [state, setState] = useState<ScannerState>('checking')
  const [devices, setDevices] = useState<ScannerDevice[]>([])
  const [settings, setSettingsState] = useState<ScannerSettings>(DEFAULT_SETTINGS)
  const [pages, setPages] = useState(0)

  /**
   * The job currently being polled, the timer polling it, and the poll itself.
   * None of the three is rendered, and a stale closure over any of them would
   * poll the wrong job, leak a timer, or notify a component that has gone.
   */
  const jobRef = useRef<string | null>(null)
  const timerRef = useRef<number | null>(null)
  const mountedRef = useRef(true)
  const pollRef = useRef<() => void>(() => {})
  const onScannedRef = useRef(onScanned)
  const separateRef = useRef(separatePages)
  /** The last completed job, so its sheets can be re-read as one document. */
  const lastJobRef = useRef<{ id: string; pageCount: number } | null>(null)

  useEffect(() => {
    onScannedRef.current = onScanned
    separateRef.current = separatePages
  }, [onScanned, separatePages])

  const stopPolling = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stopPolling()
    }
  }, [stopPolling])

  const setSettings = useCallback((next: Partial<ScannerSettings>) => {
    setSettingsState((current) => ({ ...current, ...next }))
  }, [])

  /** Writes a finished probe into state. */
  const applyProbe = useCallback((outcome: ProbeOutcome) => {
    setDevices(outcome.devices)
    setState(outcome.state)

    // Settling on a device here means a scan request never has to guess, and
    // the panel can name the scanner it is about to use.
    if (outcome.devices.length > 0) {
      setSettingsState((current) =>
        current.deviceId && outcome.devices.some((device) => device.id === current.deviceId)
          ? current
          : { ...current, deviceId: outcome.devices[0].id },
      )
    }
  }, [])

  // One probe on mount. The helper is either running or it is not, and asking
  // on a timer would spend a workstation's cycles finding that out repeatedly.
  useEffect(() => {
    let cancelled = false

    void probeScanner(agent).then((outcome) => {
      if (!cancelled) {
        applyProbe(outcome)
      }
    })

    return () => {
      cancelled = true
    }
  }, [agent, applyProbe])

  /** One poll of the active job, rescheduling itself until the job settles. */
  const poll = useCallback(async () => {
    const jobId = jobRef.current
    if (!jobId) {
      return
    }

    try {
      const job = await agent.getJob(jobId)
      if (!mountedRef.current || jobRef.current !== jobId) {
        return
      }

      setPages(job.pages)

      if (job.state === 'scanning' || job.state === 'queued' || job.state === 'processing') {
        setState(job.state === 'processing' ? 'processing' : 'scanning')
        timerRef.current = window.setTimeout(() => pollRef.current(), POLL_INTERVAL_MS)
        return
      }

      jobRef.current = null

      if (job.state === 'completed') {
        const pageCount = job.result?.pageCount ?? 1
        lastJobRef.current = { id: jobId, pageCount }

        // Reading ten sheets off the agent is fast but not instant, and the
        // panel should not claim the scan is done while it is still fetching.
        setState('processing')

        /**
         * A stack of sheets is a stack of gate passes unless told otherwise,
         * so each page is collected as its own file. The pages are fetched in
         * sequence rather than at once: the agent is a single-threaded helper
         * on somebody's workstation, not a CDN.
         */
        const documents: ScannedDocument[] = []

        if (separateRef.current && pageCount > 1) {
          for (let index = 0; index < pageCount; index += 1) {
            documents.push(await agent.collectPage(jobId, index))
          }
        } else {
          documents.push(await agent.collect(jobId))
        }

        if (!mountedRef.current) {
          return
        }

        setState('completed')
        onScannedRef.current(documents)
        return
      }

      if (job.state === 'cancelled') {
        setState('ready')
        return
      }

      // The agent already narrowed the driver's failure to something the panel
      // has words for; anything it could not classify becomes a plain failure.
      setState(FAILURE_STATES[job.reason ?? ''] ?? 'failed')
    } catch (error) {
      if (!mountedRef.current) {
        return
      }
      jobRef.current = null
      setState(stateForAgentError(error))
    }
  }, [agent])

  // The poll reschedules itself, so it reaches the next tick through a ref
  // rather than closing over a function that has not been declared yet.
  useEffect(() => {
    pollRef.current = () => void poll()
  }, [poll])

  const startScan = useCallback(async () => {
    stopPolling()
    setPages(0)
    setState('scanning')

    try {
      const job = await agent.startScan({
        deviceId: settings.deviceId || undefined,
        source: settings.source,
        resolution: settings.resolution,
        colorMode: settings.colorMode,
      })

      if (!mountedRef.current) {
        return
      }

      jobRef.current = job.id
      timerRef.current = window.setTimeout(() => pollRef.current(), POLL_INTERVAL_MS)
    } catch (error) {
      if (!mountedRef.current) {
        return
      }
      // A refused start is almost always the scanner already running a job.
      setState(
        error instanceof ScannerAgentError && error.failure === 'error'
          ? 'busy'
          : stateForAgentError(error),
      )
    }
  }, [agent, settings, stopPolling])

  const cancel = useCallback(async () => {
    const jobId = jobRef.current
    stopPolling()
    jobRef.current = null
    setState('ready')

    if (jobId) {
      // Best effort: the panel has already returned to ready, and a helper
      // that cannot be told is a helper that was not going to finish either.
      await agent.cancel(jobId).catch(() => undefined)
    }
  }, [agent, stopPolling])

  const check = useCallback(() => {
    setState('checking')

    void probeScanner(agent).then((outcome) => {
      if (mountedRef.current) {
        applyProbe(outcome)
      }
    })
  }, [agent, applyProbe])

  const reset = useCallback(() => {
    stopPolling()
    jobRef.current = null
    setPages(0)
    setState((current) =>
      devices.length > 0 ? 'ready' : current === 'completed' ? 'idle' : current,
    )
  }, [devices.length, stopPolling])

  const combineLast = useCallback(async (): Promise<ScannedDocument | null> => {
    const last = lastJobRef.current
    if (!last || last.pageCount < 2) {
      return null
    }

    // The agent holds a finished scan for ten minutes, so an operator who
    // realises the sheets were one gate pass does not have to feed them again.
    return agent.collect(last.id).catch(() => null)
  }, [agent])

  const activeDevice = useMemo(
    () => devices.find((device) => device.id === settings.deviceId) ?? devices[0] ?? null,
    [devices, settings.deviceId],
  )

  return {
    state,
    devices,
    activeDevice,
    settings,
    setSettings,
    pages,
    check,
    scan: () => void startScan(),
    cancel: () => void cancel(),
    reset,
    combineLast,
  }
}
