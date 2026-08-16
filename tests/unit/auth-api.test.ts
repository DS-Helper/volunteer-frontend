import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import { completeOAuthLogin, getOAuthLoginUrl } from '@/features/auth/auth-api'
import { apiClient } from '@/lib/api'

const getMock = vi.mocked(apiClient.get)
const postMock = vi.mocked(apiClient.post)

describe('OAuth API 계약', () => {
  it.each(['kakao', 'naver', 'google'] as const)('provider %s의 login-url을 요청한다', async (provider) => {
    getMock.mockResolvedValueOnce('https://provider.example/authorize?state=state-value')

    await expect(getOAuthLoginUrl(provider, `https://volunteer.dshelper.kr/${provider}/callback`)).resolves.toContain('state=state-value')
    expect(getMock).toHaveBeenCalledWith(`/oauth/${provider}/login-url`, {
      query: { redirectUri: `https://volunteer.dshelper.kr/${provider}/callback` },
      unwrapData: false,
      responseType: 'text',
    })
  })

  it.each(['kakao', 'naver', 'google'] as const)('provider %s login에 code와 state를 함께 보낸다', async (provider) => {
    postMock.mockResolvedValueOnce({ accessToken: 'access', refreshToken: 'refresh' })

    await expect(completeOAuthLogin(provider, { code: 'oauth-code', state: 'oauth-state' })).resolves.toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
    })
    expect(postMock).toHaveBeenCalledWith(`/oauth/${provider}/login`, { code: 'oauth-code', state: 'oauth-state' })
  })
})
