'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiError } from '@/lib/errors'
import { getOAuthLoginUrl, type OAuthProvider } from '@/features/auth'

const providers: Array<{ id: OAuthProvider; label: string }> = [
  { id: 'kakao', label: '카카오로 시작하기' },
  { id: 'naver', label: '네이버로 시작하기' },
  { id: 'google', label: 'Google로 시작하기' },
]

export default function LoginPage() {
  const router = useRouter()
  const [pending, setPending] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function startLogin(provider: OAuthProvider) {
    setPending(provider)
    setError(null)
    try {
      const redirectUri = provider === 'kakao'
        ? `${window.location.origin}/kakao/callback`
        : undefined
      const url = await getOAuthLoginUrl(provider, redirectUri)
      window.location.assign(url)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : '로그인 주소를 불러오지 못했습니다.')
      setPending(null)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
      <h1 className="text-3xl font-extrabold text-[var(--text-strong)]">로그인</h1>
      <p className="mt-3 text-sm text-[var(--text-muted)]">DS Helper 봉사단 서비스를 이용하려면 로그인해 주세요.</p>
      <div className="mt-8 space-y-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            disabled={pending !== null}
            onClick={() => void startLogin(provider.id)}
            className="w-full rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white disabled:opacity-50"
          >
            {pending === provider.id ? '이동 중…' : provider.label}
          </button>
        ))}
      </div>
      {error ? <p role="alert" className="mt-4 text-sm text-red-600">{error}</p> : null}
      <button type="button" onClick={() => router.back()} className="mt-6 text-sm text-[var(--text-muted)] underline">돌아가기</button>
    </main>
  )
}
