import type { OAuthProvider } from './auth-api'

export function getOAuthRedirectUri(origin: string, provider: OAuthProvider): string {
  if (provider === 'kakao') return `${origin}/kakao/callback`
  if (provider === 'google') return `${origin}/google/callback`
  return `${origin}/oauth/${provider}/callback`
}
