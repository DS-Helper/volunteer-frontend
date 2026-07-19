import { apiClient } from '@/lib/api'

export type OAuthProvider = 'kakao' | 'naver' | 'google'

export interface JwtResponse {
  accessToken: string
  refreshToken: string
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
  const body = provider === 'kakao' || provider === 'naver' ? input : { code: input.code }
  return apiClient.post<JwtResponse>(`${providerPaths[provider]}/login`, body)
}
