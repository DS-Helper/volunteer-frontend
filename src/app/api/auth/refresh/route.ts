import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getPrisma } from '@/server/db/prisma'
import { signAccessToken, ACCESS_TOKEN_EXPIRES_IN } from '@/server/auth/jwt'
import { rotateRefreshSession } from '@/server/auth/session'

export async function POST() {
  const cookieStore = await cookies()
  const current = cookieStore.get('refreshToken')?.value
  if (!current) return NextResponse.json({ code: 'AUTH_REFRESH_REQUIRED', message: '재인증이 필요합니다.' }, { status: 401 })
  const rotated = await rotateRefreshSession(current)
  if (!rotated) return NextResponse.json({ code: 'AUTH_REFRESH_INVALID', message: '세션이 만료되었습니다.' }, { status: 401 })
  const user = await getPrisma().user.findUnique({ where: { id: rotated.userId }, select: { id: true, username: true, role: true, status: true } })
  if (!user || user.status !== 'ACTIVE') return NextResponse.json({ code: 'AUTH_ACCOUNT_INACTIVE', message: '사용할 수 없는 계정입니다.' }, { status: 403 })
  const accessToken = await signAccessToken({ sub: user.id, role: user.role, tokenType: 'accessToken' })
  const response = NextResponse.json({ data: { user: { id: user.id, username: user.username, role: user.role }, accessToken, expiresIn: ACCESS_TOKEN_EXPIRES_IN } })
  response.cookies.set('refreshToken', rotated.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth', expires: rotated.expiresAt })
  return response
}
