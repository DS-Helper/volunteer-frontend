import { NextResponse } from 'next/server'
import { z } from 'zod'

import { registerUser } from '@/server/auth/auth-service'
import { validatePasswordPolicy } from '@/server/auth/password'
import { validateUsername } from '@/server/auth/username'

const schema = z.object({ username: z.string(), password: z.string(), passwordConfirmation: z.string() })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ code: 'AUTH_INVALID_REQUEST', message: '가입 정보를 확인해 주세요.' }, { status: 400 })
  const { username, password, passwordConfirmation } = parsed.data
  const usernameError = validateUsername(username)
  const passwordError = validatePasswordPolicy(password)
  if (usernameError || passwordError || password !== passwordConfirmation) return NextResponse.json({ code: 'AUTH_INVALID_REQUEST', message: usernameError ?? passwordError ?? '비밀번호 확인이 일치하지 않습니다.' }, { status: 400 })
  try {
    const result = await registerUser(username, password)
    const response = NextResponse.json({ data: { user: result.user, accessToken: result.accessToken, expiresIn: result.expiresIn } }, { status: 201 })
    response.cookies.set('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth', expires: result.refreshExpiresAt })
    return response
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) return NextResponse.json({ code: 'AUTH_USERNAME_TAKEN', message: '이미 사용 중인 아이디입니다.' }, { status: 409 })
    return NextResponse.json({ code: 'AUTH_REGISTER_FAILED', message: '가입을 처리하지 못했습니다.' }, { status: 500 })
  }
}
