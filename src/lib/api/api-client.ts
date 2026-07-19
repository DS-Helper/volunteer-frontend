import { ApiError, type ApiErrorPayload } from '@/lib/errors'

import type {
  ApiQuery,
  ApiRequestOptions,
  ApiResponse,
  ApiResponseType,
} from './types'

const DEFAULT_ERROR_MESSAGE =
  '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'

const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'
const inflightRequests = new Map<string, Promise<unknown>>()

function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

function appendQuery(path: string, query: ApiQuery): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') {
      continue
    }

    const values = Array.isArray(value) ? value : [value]
    for (const item of values) {
      searchParams.append(key, String(item))
    }
  }

  const queryString = searchParams.toString()
  if (!queryString) {
    return path
  }

  return `${path}${path.includes('?') ? '&' : '?'}${queryString}`
}

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBaseUrl}${normalizedPath}`
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData
}

function isBodyInit(value: unknown): value is BodyInit {
  return (
    typeof value === 'string' ||
    isFormData(value) ||
    (typeof Blob !== 'undefined' && value instanceof Blob) ||
    (typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams) ||
    (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) ||
    (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(value)) ||
    (typeof ReadableStream !== 'undefined' && value instanceof ReadableStream)
  )
}

function serializeBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined) {
    return undefined
  }

  if (isBodyInit(body)) {
    return body
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return JSON.stringify(body)
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.prototype.hasOwnProperty.call(value, 'data')
  )
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<ApiErrorPayload>
  return typeof candidate.code === 'string' && typeof candidate.message === 'string'
}

function isBackendErrorPayload(
  value: unknown,
): value is { code: { code: string }; message: string } {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as { code?: unknown; message?: unknown }
  return (
    typeof candidate.message === 'string' &&
    typeof candidate.code === 'object' &&
    candidate.code !== null &&
    typeof (candidate.code as { code?: unknown }).code === 'string'
  )
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (isApiErrorPayload(payload)) {
    return new ApiError({
      code: payload.code,
      message: payload.message,
      fieldErrors: payload.fieldErrors ?? [],
      status: response.status,
    })
  }

  if (isBackendErrorPayload(payload)) {
    return new ApiError({
      code: payload.code.code,
      message: payload.message,
      status: response.status,
    })
  }

  return new ApiError({
    code: `HTTP_${response.status}`,
    message: response.statusText || DEFAULT_ERROR_MESSAGE,
    status: response.status,
  })
}

async function parseSuccessResponse<T>(
  response: Response,
  responseType: ApiResponseType,
  unwrapData: boolean,
): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  if (responseType === 'blob') {
    return (await response.blob()) as T
  }

  if (responseType === 'text') {
    return (await response.text()) as T
  }

  const payload: unknown = await response.json()
  if (unwrapData && isApiResponse<T>(payload)) {
    return payload.data
  }

  return payload as T
}

export class ApiClient {
  readonly baseUrl: string

  constructor(baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? '') {
    this.baseUrl = baseUrl
  }

  async request<TResult, TBody = unknown>(
    path: string,
    options: ApiRequestOptions<TBody, TResult> = {},
  ): Promise<TResult> {
    const method = options.method?.toUpperCase() ?? 'GET'
    const query = options.query ?? {}
    const body = options.body
    const key = `${method}:${path}:${JSON.stringify(query)}:${typeof body === 'string' ? body : typeof FormData !== 'undefined' && body instanceof FormData ? '[form-data]' : JSON.stringify(body ?? null)}`
    if (!options.signal) {
      const existing = inflightRequests.get(key)
      if (existing) return existing as Promise<TResult>
    }
    const promise = this.requestInternal<TResult, TBody>(path, options)
    if (!options.signal) {
      inflightRequests.set(key, promise)
      void promise.finally(() => {
        if (inflightRequests.get(key) === promise) inflightRequests.delete(key)
      })
    }
    return promise
  }

  private async requestInternal<TResult, TBody = unknown>(
    path: string,
    options: ApiRequestOptions<TBody, TResult> = {},
  ): Promise<TResult> {
    const {
      body,
      headers: initialHeaders,
      mock,
      next,
      query = {},
      responseType = 'json',
      signal,
      unwrapData = true,
      ...requestInit
    } = options
    const method = requestInit.method?.toUpperCase() ?? 'GET'
    const headers = new Headers(initialHeaders)

    if (!headers.has('Accept')) {
      headers.set('Accept', responseType === 'json' ? 'application/json' : '*/*')
    }

    const accessToken = getStoredAccessToken()
    if (accessToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    if (!this.baseUrl) {
      if (!mock) {
        throw new ApiError({
          code: 'API_BASE_URL_MISSING',
          message:
            'API 주소가 설정되지 않았고 사용할 수 있는 목업 응답도 없습니다.',
        })
      }

      return mock({
        path,
        method,
        query,
        body,
        headers,
        signal: signal ?? null,
      })
    }

    const url = joinUrl(this.baseUrl, appendQuery(path, query))
    const serializedBody = serializeBody(body, headers)

    let response: Response
    try {
      response = await fetch(url, {
        ...requestInit,
        body: serializedBody,
        credentials: 'include',
        headers,
        method,
        next,
        signal,
      } as RequestInit & { next?: typeof next })
    } catch (error) {
      throw new ApiError({
        code: 'NETWORK_ERROR',
        message: DEFAULT_ERROR_MESSAGE,
        cause: error,
      })
    }

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
        window.localStorage.removeItem('refreshToken')
        window.dispatchEvent(new Event('dshelper-auth-changed'))
        if (!window.location.pathname.startsWith('/login')) {
          window.location.assign(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`)
        }
      }
      throw await parseErrorResponse(response)
    }

    return parseSuccessResponse<TResult>(response, responseType, unwrapData)
  }

  get<TResult>(
    path: string,
    options?: ApiRequestOptions<never, TResult>,
  ): Promise<TResult> {
    return this.request<TResult, never>(path, { ...options, method: 'GET' })
  }

  post<TResult, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: ApiRequestOptions<TBody, TResult>,
  ): Promise<TResult> {
    return this.request<TResult, TBody>(path, {
      ...options,
      body,
      method: 'POST',
    })
  }

  patch<TResult, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: ApiRequestOptions<TBody, TResult>,
  ): Promise<TResult> {
    return this.request<TResult, TBody>(path, {
      ...options,
      body,
      method: 'PATCH',
    })
  }

  delete<TResult, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: ApiRequestOptions<TBody, TResult>,
  ): Promise<TResult> {
    return this.request<TResult, TBody>(path, {
      ...options,
      body,
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient()
