import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { Buffer } from 'node:buffer'

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET
  if (!secret || secret.length < 32) throw new Error('AUTH_JWT_SECRET must be at least 32 characters.')
  return Uint8Array.from(Buffer.from(secret, 'utf8'))
}

export interface AccessTokenClaims {
  sub: string
  role: 'USER' | 'ADMIN'
  tokenType: 'accessToken'
}

export async function signAccessToken(claims: AccessTokenClaims): Promise<string> {
  return new SignJWT({ role: claims.role, tokenType: claims.tokenType })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setJti(crypto.randomUUID())
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(getJwtSecret())
}

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims> {
  const result = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] })
  const payload = result.payload as JWTPayload & Partial<AccessTokenClaims>
  if (!payload.sub || payload.tokenType !== 'accessToken' || (payload.role !== 'USER' && payload.role !== 'ADMIN')) {
    throw new Error('Invalid access token claims.')
  }
  return { sub: payload.sub, role: payload.role, tokenType: payload.tokenType }
}

export const ACCESS_TOKEN_EXPIRES_IN = ACCESS_TOKEN_TTL_SECONDS
