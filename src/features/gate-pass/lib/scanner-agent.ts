/**
 * The seam between the Gate Pass module and a physical scanner.
 *
 * A browser cannot drive a TWAIN or WIA scanner. What it can do is talk to
 * something running on the same machine that can, which is what
 * `LBTS-Scanner-Agent/` is: a loopback service that shells into Windows Image
 * Acquisition and hands back a JPEG or a PDF.
 *
 * Everything above this file is written against `ScannerAgent`, so the Gate
 * Pass module never learns what is on the other end. Replacing WIA with a
 * vendor SDK, or with a different transport entirely, is a new implementation
 * of this interface and no change to a single component.
 */

export type ScanSource = 'flatbed' | 'feeder'
export type ScanColorMode = 'color' | 'grayscale' | 'blackwhite'
export const SCAN_RESOLUTIONS = [200, 300, 600] as const
export type ScanResolution = (typeof SCAN_RESOLUTIONS)[number]

export interface ScannerDevice {
  id: string
  name: string
  description: string
  hasFeeder: boolean
  hasFlatbed: boolean
}

export type ScanJobState =
  | 'queued'
  | 'scanning'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'failed'

export type ScanFailureReason =
  | 'no-device'
  | 'busy'
  | 'no-paper'
  | 'cover-open'
  | 'paper-jam'
  | 'driver-error'
  | 'cancelled'
  | 'unknown'

export interface ScanJob {
  id: string
  state: ScanJobState
  pages: number
  startedAt: string
  finishedAt: string | null
  reason: ScanFailureReason | null
  message: string | null
  result: {
    mimeType: 'image/jpeg' | 'application/pdf'
    size: number
    pageCount: number
    filename: string
  } | null
}

export interface ScanRequest {
  deviceId?: string
  source?: ScanSource
  resolution?: ScanResolution
  colorMode?: ScanColorMode
}

export interface ScannedDocument {
  file: File
  pageCount: number
}

/**
 * Why the agent itself could not be reached or used, as opposed to why a scan
 * failed. The two need different words in front of the operator: one is "start
 * the helper", the other is "close the lid".
 */
export type AgentFailure = 'unreachable' | 'unauthorized' | 'unsupported' | 'error'

export class ScannerAgentError extends Error {
  public readonly failure: AgentFailure

  constructor(failure: AgentFailure, message: string) {
    super(message)
    this.name = 'ScannerAgentError'
    this.failure = failure
  }
}

export interface ScannerAgent {
  /** Resolves when an agent answers; rejects with a ScannerAgentError otherwise. */
  probe: () => Promise<{ version: string; scanningAvailable: boolean }>
  listDevices: () => Promise<ScannerDevice[]>
  startScan: (request: ScanRequest) => Promise<ScanJob>
  getJob: (jobId: string) => Promise<ScanJob>
  cancel: (jobId: string) => Promise<void>
  /**
   * The whole job as one file — the page itself, or a PDF of all of them.
   * This is what one gate pass spanning several sheets needs.
   */
  collect: (jobId: string) => Promise<ScannedDocument>
  /**
   * One sheet of the job, zero-indexed.
   *
   * This is how a stack of separate gate passes is taken off the feeder: ten
   * sheets are ten records, not a ten-page document, and only the operator
   * knows which of the two a given stack is. Both are available; the
   * workspace asks for whichever the operator chose.
   */
  collectPage: (jobId: string, index: number) => Promise<ScannedDocument>
}

/**
 * Where the agent lives, and the token that lets this page use it.
 *
 * Held in localStorage on purpose, and it is not the profile persistence
 * CLAUDE.md rules out: this is a pairing between one browser and one physical
 * scanner on one desk, it carries no identity and no role, and losing it costs
 * a re-paste rather than a wrong access decision.
 */
const TOKEN_KEY = 'lbts.scanner.token'
const URL_KEY = 'lbts.scanner.url'
const DEFAULT_AGENT_URL = 'http://127.0.0.1:39217'

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    // Private browsing, or storage disabled by policy.
    return null
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) {
      window.localStorage.removeItem(key)
    } else {
      window.localStorage.setItem(key, value)
    }
  } catch {
    // The pairing simply does not survive a reload. Nothing else breaks.
  }
}

export function getScannerToken(): string {
  return read(TOKEN_KEY) ?? ''
}

export function setScannerToken(token: string): void {
  write(TOKEN_KEY, token.trim() || null)
}

export function getScannerAgentUrl(): string {
  return read(URL_KEY) ?? DEFAULT_AGENT_URL
}

export function setScannerAgentUrl(url: string): void {
  const trimmed = url.trim().replace(/\/+$/, '')
  write(URL_KEY, trimmed === DEFAULT_AGENT_URL || trimmed === '' ? null : trimmed)
}

export function isScannerPaired(): boolean {
  return getScannerToken().length > 0
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  /** Long enough for a slow answer, short enough not to hang the panel. */
  timeoutMs?: number
}

async function call(path: string, options: RequestOptions = {}): Promise<Response> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 20_000)

  let response: Response

  try {
    response = await fetch(`${getScannerAgentUrl()}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        ...(getScannerToken() ? { Authorization: `Bearer ${getScannerToken()}` } : {}),
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      // The agent is a different origin; no app cookies belong on it.
      credentials: 'omit',
    })
  } catch {
    // fetch rejects for a refused connection, a DNS failure, an abort and a
    // blocked cross-origin request alike — from here they are one thing: the
    // helper is not answering.
    throw new ScannerAgentError('unreachable', 'The scanner helper is not running on this computer.')
  } finally {
    window.clearTimeout(timer)
  }

  if (response.status === 401) {
    throw new ScannerAgentError('unauthorized', 'This computer is not paired with the scanner helper.')
  }

  if (!response.ok && response.status !== 409) {
    throw new ScannerAgentError('error', 'The scanner helper could not complete that request.')
  }

  return response
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

/**
 * The one implementation that exists today. It is deliberately thin: every
 * decision about retries, polling and what the operator is told lives in
 * `use-scanner.ts`, so a second implementation would not have to repeat any of
 * it.
 */
export function createHttpScannerAgent(): ScannerAgent {
  return {
    async probe() {
      const response = await call('/v1/health', { timeoutMs: 4000 })
      const health = await readJson<{ version: string; scanningAvailable: boolean }>(response)
      return { version: health.version, scanningAvailable: health.scanningAvailable }
    },

    async listDevices() {
      const response = await call('/v1/devices', { timeoutMs: 35_000 })
      return (await readJson<{ devices: ScannerDevice[] }>(response)).devices
    },

    async startScan(request) {
      const response = await call('/v1/scan', {
        method: 'POST',
        body: request,
        timeoutMs: 10_000,
      })

      if (response.status === 409) {
        throw new ScannerAgentError('error', 'The scanner is already busy with another job.')
      }

      return (await readJson<{ job: ScanJob }>(response)).job
    },

    async getJob(jobId) {
      const response = await call(`/v1/scan/${jobId}`, { timeoutMs: 8000 })
      return (await readJson<{ job: ScanJob }>(response)).job
    },

    async cancel(jobId) {
      await call(`/v1/scan/${jobId}/cancel`, { method: 'POST', timeoutMs: 8000 })
    },

    async collect(jobId) {
      return download(`/v1/scan/${jobId}/result`, `scan-${jobId.slice(0, 8)}`)
    },

    async collectPage(jobId, index) {
      return download(
        `/v1/scan/${jobId}/pages/${index}`,
        `scan-${jobId.slice(0, 8)}-p${String(index + 1).padStart(2, '0')}`,
      )
    },
  }
}

/** Turns one of the agent's two file endpoints into a File the form can send. */
async function download(path: string, stem: string): Promise<ScannedDocument> {
  // A 25 MB multi-page PDF over loopback is fast, but not instant.
  const response = await call(path, { timeoutMs: 60_000 })

  const blob = await response.blob()
  const pageCount = Number.parseInt(response.headers.get('X-Scan-Pages') ?? '1', 10)
  const type = blob.type || 'image/jpeg'
  const extension = type === 'application/pdf' ? 'pdf' : 'jpg'

  return {
    file: new File([blob], `${stem}.${extension}`, { type }),
    pageCount: Number.isInteger(pageCount) && pageCount > 0 ? pageCount : 1,
  }
}
