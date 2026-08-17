'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loginWithPassword, registerWithPassword, setLocalAuthUser, saveAuthTokens } from '@/features/auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [localPending, setLocalPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submitLocalAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalPending(true)
    setError(null)
    try {
      const result = mode === 'login'
        ? await loginWithPassword({ username, password })
        : await registerWithPassword({ username, password, passwordConfirmation })
      saveAuthTokens({ accessToken: result.accessToken })
      setLocalAuthUser(result.user)
      router.replace(searchParams.get('returnTo')?.startsWith('/') ? searchParams.get('returnTo')! : '/volunteer')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '인증 요청을 처리하지 못했습니다.')
    } finally {
      setLocalPending(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
      <h1 className="text-3xl font-extrabold text-[var(--text-strong)]">로그인</h1>
      <p className="mt-3 text-sm text-[var(--text-muted)]">DS Helper 봉사단 서비스를 이용하려면 로그인해 주세요.</p>
      <form onSubmit={submitLocalAuth} className="mt-8 space-y-3">
        <label className="block text-sm font-bold" htmlFor="username">아이디</label>
        <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} required className="w-full rounded-xl border border-[var(--line)] px-4 py-3" autoComplete="username" />
        <label className="block text-sm font-bold" htmlFor="password">비밀번호</label>
        <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="w-full rounded-xl border border-[var(--line)] px-4 py-3" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        {mode === 'register' ? <><label className="block text-sm font-bold" htmlFor="passwordConfirmation">비밀번호 확인</label><input id="passwordConfirmation" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required className="w-full rounded-xl border border-[var(--line)] px-4 py-3" autoComplete="new-password" /></> : null}
        <button type="submit" disabled={localPending} className="w-full rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white disabled:opacity-50">{localPending ? '처리 중…' : mode === 'login' ? '아이디로 로그인' : '회원가입'}</button>
        <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="w-full text-sm underline">{mode === 'login' ? '회원가입으로 전환' : '로그인으로 전환'}</button>
      </form>
      {error ? <p role="alert" className="mt-4 text-sm text-red-600">{error}</p> : null}
      <button type="button" onClick={() => router.back()} className="mt-6 text-sm text-[var(--text-muted)] underline">돌아가기</button>
    </main>
  )
}
