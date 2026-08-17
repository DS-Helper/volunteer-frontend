import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { revokeRefreshSession } from '@/server/auth/session'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('refreshToken')?.value
  if (token) await revokeRefreshSession(token)
  const response = new NextResponse(null, { status: 204 })
  response.cookies.set('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth', maxAge: 0 })
  return response
}
