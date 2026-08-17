const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{1,62}[a-z0-9])?$/

export function normalizeUsername(value: string): string {
  return value.trim().normalize('NFKC').toLowerCase()
}

export function validateUsername(value: string): string | null {
  const normalized = normalizeUsername(value)
  if (normalized.length < 3 || normalized.length > 64) return '아이디는 3~64자여야 합니다.'
  if (!USERNAME_PATTERN.test(normalized)) return '아이디는 영문 소문자, 숫자, ., _, -만 사용할 수 있습니다.'
  return null
}
