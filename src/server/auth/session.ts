import 'server-only'

import { createHash, randomBytes } from 'node:crypto'

import { getPrisma } from '@/server/db/prisma'

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createRefreshSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(48).toString('base64url')
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
  await getPrisma().refreshSession.create({ data: { userId, tokenHash: hashRefreshToken(token), expiresAt } })
  return { token, expiresAt }
}

export async function rotateRefreshSession(token: string): Promise<{ userId: string; token: string; expiresAt: Date } | null> {
  const prisma = getPrisma()
  const session = await prisma.refreshSession.findFirst({ where: { tokenHash: hashRefreshToken(token) } })
  if (!session || session.revokedAt || session.expiresAt <= new Date()) return null
  const next = await createRefreshSession(session.userId)
  await prisma.refreshSession.update({ where: { id: session.id }, data: { revokedAt: new Date(), replacedBy: (await prisma.refreshSession.findFirst({ where: { tokenHash: hashRefreshToken(next.token) }, select: { id: true } }))?.id, lastUsedAt: new Date() } })
  return { userId: session.userId, ...next }
}

export async function revokeRefreshSession(token: string): Promise<void> {
  await getPrisma().refreshSession.updateMany({ where: { tokenHash: hashRefreshToken(token), revokedAt: null }, data: { revokedAt: new Date() } })
}
