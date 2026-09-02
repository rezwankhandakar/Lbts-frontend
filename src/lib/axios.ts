import axios from 'axios'
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { config } from '@/app/config'
import { getIdToken } from '@/lib/firebase'

/** Every rejection from this instance is normalized to this shape. */
export interface ApiError {
  message: string
  statusCode: number
  errorSources: ApiErrorSource[]
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
