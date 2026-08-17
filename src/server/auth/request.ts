import 'server-only'

import { verifyAccessToken, type AccessTokenClaims } from './jwt'

export async function optionalAccessToken(request: Request): Promise<AccessTokenClaims | null> {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null
  try { return await verifyAccessToken(header.slice(7).trim()) } catch { return null }
}

export async function requiredAccessToken(request: Request): Promise<AccessTokenClaims> {
  const claims = await optionalAccessToken(request)
  if (!claims) throw new Response(JSON.stringify({ code: 'AUTH_REQUIRED', message: '로그인이 필요합니다.' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  return claims
}

export async function requiredAdmin(request: Request): Promise<AccessTokenClaims> {
  const claims = await requiredAccessToken(request)
  if (claims.role !== 'ADMIN') throw new Response(JSON.stringify({ code: 'AUTH_FORBIDDEN', message: '관리자 권한이 필요합니다.' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
  return claims
}
