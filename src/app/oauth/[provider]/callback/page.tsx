'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { completeOAuthLogin, hydrateUserStore, saveAuthTokens, type OAuthProvider } from '@/features/auth'

const providers: OAuthProvider[] = ['kakao', 'naver', 'google']

export function OAuthCallbackPage({ providerOverride }: { providerOverride?: OAuthProvider }) {
  const params = useParams<{ provider: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [message, setMessage] = useState('로그인 처리 중입니다…')
  const provider = providerOverride ?? (params.provider as OAuthProvider)
  const code = searchParams.get('code')
  const state = searchParams.get('state') ?? undefined
  const invalidResponse = !providers.includes(provider) || !code

  useEffect(() => {
    if (invalidResponse || !code) return
    void completeOAuthLogin(provider, { code, state })
      .then((tokens) => {
        saveAuthTokens(tokens)
        return hydrateUserStore().then(() => router.replace('/volunteer'))
      })
      .catch(() => setMessage('로그인에 실패했습니다. 다시 시도해 주세요.'))
  }, [code, invalidResponse, provider, router, state])

  return <main className="mx-auto flex min-h-[50vh] w-full max-w-md items-center justify-center px-5 text-center"><p role="status">{invalidResponse ? 'OAuth 인증 응답이 올바르지 않습니다.' : message}</p></main>
}

export default OAuthCallbackPage
