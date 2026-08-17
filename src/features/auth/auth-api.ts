import { apiClient } from '@/lib/api'

export type OAuthProvider = 'kakao' | 'naver' | 'google'

export interface JwtResponse {
  accessToken: string
  refreshToken: string
}

export interface LocalAuthUser {
  id: string
  username: string
  role: 'USER' | 'ADMIN'
}

export interface LocalAuthResponse {
  user: LocalAuthUser
  accessToken: string
  expiresIn: number
}

async function localAuthRequest(path: string, body: unknown, init?: RequestInit): Promise<LocalAuthResponse> {
  const response = await fetch(path, {
    ...init,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...init?.headers },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => null) as { data?: LocalAuthResponse; message?: string } | null
  if (!response.ok || !payload?.data) throw new Error(payload?.message ?? '인증 요청을 처리하지 못했습니다.')
  return payload.data
}

export function registerWithPassword(input: { username: string; password: string; passwordConfirmation: string }): Promise<LocalAuthResponse> {
  return localAuthRequest('/api/auth/register', input)
}

export function loginWithPassword(input: { username: string; password: string }): Promise<LocalAuthResponse> {
  return localAuthRequest('/api/auth/login', input)
}

const providerPaths: Record<OAuthProvider, string> = {
  kakao: '/oauth/kakao',
  naver: '/oauth/naver',
  google: '/oauth/google',
}

export function getOAuthLoginUrl(provider: OAuthProvider, redirectUri?: string): Promise<string> {
  return apiClient.get<string>(`${providerPaths[provider]}/login-url`, {
    query: redirectUri ? { redirectUri } : undefined,
    unwrapData: false,
    responseType: 'text',
  })
}

export function completeOAuthLogin(
  provider: OAuthProvider,
  input: { code: string; state?: string },
): Promise<JwtResponse> {
  const body = provider === 'kakao' || provider === 'naver' || provider === 'google'
    ? input
    : { code: input.code }
  return apiClient.post<JwtResponse>(`${providerPaths[provider]}/login`, body)
}
