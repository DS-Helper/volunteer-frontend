export interface ApiResponse<T> {
  data: T
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type ApiQueryPrimitive = string | number | boolean

export type ApiQueryValue =
  | ApiQueryPrimitive
  | readonly ApiQueryPrimitive[]
  | null
  | undefined

export type ApiQuery = Record<string, ApiQueryValue>

export type ApiResponseType = 'json' | 'blob' | 'text'

export interface NextFetchConfiguration {
  revalidate?: number | false
  tags?: string[]
}

export interface MockApiRequest<TBody = unknown> {
  path: string
  method: string
  query: ApiQuery
  body: TBody | undefined
  headers: Headers
  signal: AbortSignal | null
}

export interface ApiRequestOptions<TBody = unknown, TResult = unknown>
  extends Omit<RequestInit, 'body' | 'credentials' | 'method'> {
  method?: string
  query?: ApiQuery
  body?: TBody
  next?: NextFetchConfiguration
  responseType?: ApiResponseType
  unwrapData?: boolean
  mock?: (
    request: MockApiRequest<TBody>,
  ) => Promise<TResult> | TResult
}
