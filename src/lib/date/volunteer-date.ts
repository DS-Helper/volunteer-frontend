const SEOUL_TIME_ZONE = 'Asia/Seoul'
const SEOUL_UTC_OFFSET = '+09:00'

function toValidDate(value: string | Date): Date {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`유효하지 않은 날짜입니다: ${String(value)}`)
  }

  return date
}

function getSeoulDateParts(value: string | Date): Record<string, string> {
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: SEOUL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })

  return Object.fromEntries(
    formatter
      .formatToParts(toValidDate(value))
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value: partValue }) => [type, partValue]),
  )
}

export function formatVolunteerDate(value: string | Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: SEOUL_TIME_ZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(toValidDate(value))
}

export function formatVolunteerDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: SEOUL_TIME_ZONE,
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(toValidDate(value))
}

export function formatVolunteerTime(value: string | Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: SEOUL_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(toValidDate(value))
}

export function formatVolunteerDateTimeRange(
  startAt: string | Date,
  endAt: string | Date,
): string {
  const start = toValidDate(startAt)
  const end = toValidDate(endAt)
  const startParts = getSeoulDateParts(start)
  const endParts = getSeoulDateParts(end)
  const isSameDate =
    startParts.year === endParts.year &&
    startParts.month === endParts.month &&
    startParts.day === endParts.day

  if (isSameDate) {
    return `${formatVolunteerDate(start)} ${formatVolunteerTime(start)}~${formatVolunteerTime(end)}`
  }

  return `${formatVolunteerDateTime(start)}~${formatVolunteerDateTime(end)}`
}

export function getVolunteerDurationHours(
  startAt: string | Date,
  endAt: string | Date,
): number {
  const milliseconds =
    toValidDate(endAt).getTime() - toValidDate(startAt).getTime()
  return Math.max(0, milliseconds / 3_600_000)
}

export function formatVolunteerHours(hours: number): string {
  if (!Number.isFinite(hours) || hours < 0) {
    throw new RangeError('봉사 시간은 0 이상의 숫자여야 합니다.')
  }

  return Number.isInteger(hours) ? `${hours}시간` : `${hours.toFixed(1)}시간`
}

export function toSeoulDateTimeLocalValue(value: string | Date): string {
  const parts = getSeoulDateParts(value)
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}

export function fromSeoulDateTimeLocalValue(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    throw new RangeError('날짜와 시간을 YYYY-MM-DDTHH:mm 형식으로 입력해 주세요.')
  }

  return toValidDate(`${value}:00${SEOUL_UTC_OFFSET}`).toISOString()
}

export { SEOUL_TIME_ZONE }
