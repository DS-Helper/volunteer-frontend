import { describe, expect, it } from 'vitest'

import { getOAuthRedirectUri } from '@/features/auth/oauth-redirect'

describe('OAuth redirect URI 계약', () => {
  it.each([
    ['kakao', 'https://volunteer.dshelper.kr/kakao/callback'],
    ['google', 'https://volunteer.dshelper.kr/google/callback'],
    ['naver', 'https://volunteer.dshelper.kr/oauth/naver/callback'],
  ] as const)('%s callback 경로를 고정한다', (provider, expected) => {
    expect(getOAuthRedirectUri('https://volunteer.dshelper.kr', provider)).toBe(expected)
  })
})
