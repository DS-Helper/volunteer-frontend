const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function saveAuthTokens(tokens: {
  accessToken: string
  refreshToken?: string | null
}): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  if (tokens.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  }
  window.dispatchEvent(new Event('dshelper-auth-changed'))
}

export function clearAuthTokens(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.dispatchEvent(new Event('dshelper-auth-changed'))
}
