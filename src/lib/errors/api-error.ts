export interface ApiFieldError {
  field: string
  message: string
}

export interface ApiErrorPayload {
  code: string
  message: string
  fieldErrors?: ApiFieldError[]
}

interface ApiErrorOptions extends ApiErrorPayload {
  status?: number
  cause?: unknown
}

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly fieldErrors: ApiFieldError[]
  readonly originalCause: unknown

  constructor({
    code,
    message,
    fieldErrors = [],
    status = 0,
    cause,
  }: ApiErrorOptions) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.fieldErrors = fieldErrors
    this.originalCause = cause
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function toApiError(
  error: unknown,
  fallbackMessage = '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
): ApiError {
  if (isApiError(error)) {
    return error
  }

  return new ApiError({
    code: 'NETWORK_ERROR',
    message: error instanceof Error ? error.message || fallbackMessage : fallbackMessage,
    cause: error,
  })
}

export function getFieldErrorMap(
  error: Pick<ApiError, 'fieldErrors'>,
): Record<string, string> {
  return Object.fromEntries(
    error.fieldErrors.map(({ field, message }) => [field, message]),
  )
}
