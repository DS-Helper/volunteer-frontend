import 'server-only'

import { getPrisma } from '@/server/db/prisma'
import { hashPassword, verifyPassword } from './password'
import { createRefreshSession } from './session'
import { normalizeUsername } from './username'
import { signAccessToken, ACCESS_TOKEN_EXPIRES_IN } from './jwt'

export const AUTH_FAILURE_MESSAGE = '아이디 또는 비밀번호가 올바르지 않습니다.'
const MAX_FAILED_LOGINS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000

export async function registerUser(username: string, password: string) {
  const prisma = getPrisma()
  const normalizedUsername = normalizeUsername(username)
  const user = await prisma.user.create({ data: { username: normalizedUsername, passwordHash: await hashPassword(password) } })
  return issueTokens(user.id, user.username, user.role)
}

export async function loginUser(username: string, password: string) {
  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { username: normalizeUsername(username) } })
  if (!user) throw new Error(AUTH_FAILURE_MESSAGE)
  const valid = user
    ? user.status === 'ACTIVE' && !(user.lockedUntil && user.lockedUntil > new Date()) && await verifyPassword(password, user.passwordHash)
    : false
  if (!valid) {
    if (user.status === 'ACTIVE') {
      const failedLoginCount = user.failedLoginCount + 1
      await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount, lockedUntil: failedLoginCount >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCK_DURATION_MS) : null } })
    }
    throw new Error(AUTH_FAILURE_MESSAGE)
  }
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), failedLoginCount: 0 } })
  return issueTokens(user.id, user.username, user.role)
}

async function issueTokens(userId: string, username: string, role: 'USER' | 'ADMIN') {
  const refresh = await createRefreshSession(userId)
  return { user: { id: userId, username, role }, accessToken: await signAccessToken({ sub: userId, role, tokenType: 'accessToken' }), expiresIn: ACCESS_TOKEN_EXPIRES_IN, refreshToken: refresh.token, refreshExpiresAt: refresh.expiresAt }
}
