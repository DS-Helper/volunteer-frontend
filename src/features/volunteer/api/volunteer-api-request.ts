import {
  apiClient,
  type ApiRequestOptions,
  type MockApiRequest,
} from '@/lib/api'

async function handleMockRequest<TResult, TBody>(
  request: MockApiRequest<TBody>,
): Promise<TResult> {
  const { handleVolunteerMockRequest } = await import(
    '@/features/volunteer/data/mock-api'
  )
  return handleVolunteerMockRequest<TResult>(request)
}

export function volunteerApiRequest<TResult, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody, TResult> = {},
): Promise<TResult> {
  const useMocks = process.env.NEXT_PUBLIC_USE_VOLUNTEER_MOCKS === 'true'

  return apiClient.request<TResult, TBody>(
    path,
    useMocks
      ? {
          ...options,
          mock: (request: MockApiRequest<TBody>) =>
            handleMockRequest<TResult, TBody>(request),
        }
      : options,
  )
}

export function createJsonMultipart(
  fieldName: string,
  value: unknown,
  file?: { fieldName: string; value: File },
): FormData {
  const formData = new FormData()
  formData.append(
    fieldName,
    new Blob([JSON.stringify(value)], { type: 'application/json' }),
  )
  if (file) {
    formData.append(file.fieldName, file.value)
  }
  return formData
}
