import type { ApiError, ApiErrorSource } from '@/lib/axios'

/**
 * Two helpers for a file that comes back through axios as a blob.
 *
 * They lived in `features/gate-pass/api/gate-pass-api.ts` until the Trip DO
 * sheet needed to export a spreadsheet too. CLAUDE.md asks for a move rather
 * than a copy when a second feature wants a piece, and two copies of "read the
 * message out of a blob error" is exactly the kind of thing that ends up
 * handling one failure differently in each module.
 */

/** The name the server chose, or `fallback` if the header is unreadable. */
export function filenameFrom(disposition: unknown, fallback: string): string {
  const match =
    typeof disposition === 'string' ? /filename="?([^"';]+)"?/.exec(disposition) : null
  return match?.[1]?.trim() || fallback
}

/**
 * Recovers the message from a failed download.
 *
 * A request that asked for a blob gets a blob back even when the server
 * answered with an error, so the interceptor — which reads `data.message` —
 * finds nothing and falls back to "Request failed with status code 400". The
 * body really is JSON; it just arrived in the wrong wrapper, and the operator
 * needs to read "that is 8,000 records, narrow the filters" rather than a
 * status code.
 */
export async function withBlobMessage(error: unknown): Promise<unknown> {
  if (typeof error !== 'object' || error === null) {
    return error
  }

  const apiError = error as ApiError
  if (!(apiError.body instanceof Blob)) {
    return error
  }

  try {
    const parsed = JSON.parse(await apiError.body.text()) as {
      message?: string
      errorSources?: ApiErrorSource[]
    }

    return {
      ...apiError,
      message: parsed.message ?? apiError.message,
      errorSources: parsed.errorSources ?? [],
      body: parsed,
    } satisfies ApiError
  } catch {
    // Not JSON after all — an empty body, or a proxy's own error page.
    return error
  }
}
