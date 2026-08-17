// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { hashPassword, validatePasswordPolicy, verifyPassword } from '@/server/auth/password'
import { signAccessToken, verifyAccessToken } from '@/server/auth/jwt'

describe('local auth server primitives', () => {
  beforeEach(() => vi.stubEnv('AUTH_JWT_SECRET', 'a'.repeat(32)))
  it('enforces password length policy', () => {
    expect(validatePasswordPolicy('short')).toContain('12')
    expect(validatePasswordPolicy('a'.repeat(12))).toBeNull()
    expect(validatePasswordPolicy('a'.repeat(129))).toContain('128')
  })

  it('hashes and verifies with Argon2id', async () => {
    const password = 'correct-horse-battery-staple'
    const hash = await hashPassword(password)
    expect(hash).toContain('$argon2id$')
    await expect(verifyPassword(password, hash)).resolves.toBe(true)
    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false)
  })

  it('signs and verifies only the expected access-token claims', async () => {
    const token = await signAccessToken({ sub: 'user-id', role: 'USER', tokenType: 'accessToken' })
    await expect(verifyAccessToken(token)).resolves.toMatchObject({ sub: 'user-id', role: 'USER', tokenType: 'accessToken' })
    await expect(verifyAccessToken(`${token}.tampered`)).rejects.toThrow()
  })
})
