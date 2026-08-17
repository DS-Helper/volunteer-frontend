import { NextResponse } from 'next/server'
import { z } from 'zod'

import { AUTH_FAILURE_MESSAGE, loginUser } from '@/server/auth/auth-service'

const schema = z.object({ username: z.string(), password: z.string() })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ code: 'AUTH_INVALID_CREDENTIALS', message: AUTH_FAILURE_MESSAGE }, { status: 401 })
  try {
    const result = await loginUser(parsed.data.username, parsed.data.password)
    const response = NextResponse.json({ data: { user: result.user, accessToken: result.accessToken, expiresIn: result.expiresIn } })
    response.cookies.set('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth', expires: result.refreshExpiresAt })
    return response
  } catch {
    return NextResponse.json({ code: 'AUTH_INVALID_CREDENTIALS', message: AUTH_FAILURE_MESSAGE }, { status: 401 })
  }
}
