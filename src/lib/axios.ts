import axios from 'axios'
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { config } from '@/app/config'
import { getIdToken } from '@/lib/firebase'

/** Every rejection from this instance is normalized to this shape. */
export interface ApiError {
  message: string
  statusCode: number
  errorSources: ApiErrorSource[]
  /**
   * The raw response body, for the rare endpoint whose failure carries data.
   * A possible-duplicate gate pass is answered with a 409 and the matching
   * records, because it is a question rather than a fault — and the feature
   * that asked it needs the records to render the question.
   *
   * Nothing should read this speculatively. Narrow it in the feature that owns
   * the endpoint, as `gate-pass-api.ts` does.
   */
  body: unknown
}

export interface ApiErrorSource {
  path: string
  message: string
}

interface ApiErrorBody {
  message?: string
  errorSources?: ApiErrorSource[]
}

export const api: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * The request config every multipart upload has to pass.
 *
 * The instance above sends `application/json` on everything, which is right for
 * every request in this app but one: a `FormData` body has to carry
 * `multipart/form-data` **with the boundary the browser generates**. Naming a
 * type by hand — or leaving the JSON default in place — produces a body the
 * parser on the other side cannot read, and the symptom is not an error about
 * headers. Multer simply finds no file, and the endpoint answers with whatever
 * it says when the file is missing: "Choose or scan the signed challan copy to
 * upload", on a request that carried one.
 *
 * Clearing the header is what lets the browser set it properly. It lives here,
 * beside the default that creates the need, because it had already been written
 * out three times in three features — in two different spellings — and the
 * fourth was the one that shipped the bug.
 */
export const MULTIPART = { headers: { 'Content-Type': undefined } } as const

api.interceptors.request.use(async (request: InternalAxiosRequestConfig) => {
  // Firebase owns identity; the API verifies this ID token with firebase-admin.
  const token = await getIdToken()
  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  }
  return request
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>): Promise<never> => {
    const apiError: ApiError = {
      message: error.response?.data?.message ?? fallbackMessage(error),
      statusCode: error.response?.status ?? 0,
      errorSources: error.response?.data?.errorSources ?? [],
      body: error.response?.data,
    }

    return Promise.reject(apiError)
  },
)

function fallbackMessage(error: AxiosError): string {
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'The server took too long to respond. It may be waking up - please try again.'
  }

  if (error.code === 'ERR_NETWORK') {
    return 'Could not reach the server. Check your connection and try again.'
  }

  return error.message || 'Something went wrong.'
}
