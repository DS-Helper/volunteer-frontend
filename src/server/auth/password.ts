import argon2 from 'argon2'

const MIN_PASSWORD_LENGTH = 12
const MAX_PASSWORD_LENGTH = 128

export function validatePasswordPolicy(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`
  if (password.length > MAX_PASSWORD_LENGTH) return `비밀번호는 ${MAX_PASSWORD_LENGTH}자 이하여야 합니다.`
  return null
}

export async function hashPassword(password: string): Promise<string> {
  const policyError = validatePasswordPolicy(password)
  if (policyError) throw new Error(policyError)
  return argon2.hash(password, { type: argon2.argon2id })
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return argon2.verify(passwordHash, password)
}
