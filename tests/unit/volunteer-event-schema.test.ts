import { describe, expect, it } from 'vitest';

import { volunteerEventSchema } from '@/features/volunteer/schemas';

const validEvent = {
  title: '송해공원 플로깅 봉사',
  activityType: '환경',
  startAt: '2026-07-18T10:00',
  endAt: '2026-07-18T12:00',
  recruitmentDeadlineAt: '2026-07-18T09:00',
  location: '송해공원 일대',
  capacity: 8,
  description: '송해공원 주변을 함께 걸으며 환경을 정비합니다.',
  supplies: '편한 복장, 운동화',
  precautions: '우천 시 일정이 변경될 수 있습니다.',
  status: 'OPEN' as const,
  visibility: 'PUBLIC' as const,
};

describe('volunteerEventSchema', () => {
  it('유효한 일정과 시작 시각과 같은 모집 마감 시각을 허용한다', () => {
    const result = volunteerEventSchema.safeParse({
      ...validEvent,
      recruitmentDeadlineAt: validEvent.startAt,
    });

    expect(result.success).toBe(true);
  });

  it('문자열 모집 인원을 정수로 변환한다', () => {
    const result = volunteerEventSchema.safeParse({
      ...validEvent,
      capacity: '8',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.capacity).toBe(8);
  });

  it('종료 일시가 시작 일시보다 늦지 않으면 endAt 오류를 제공한다', () => {
    const result = volunteerEventSchema.safeParse({
      ...validEvent,
      endAt: validEvent.startAt,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.endAt).toContain(
      '종료 일시는 시작 일시보다 늦어야 합니다.',
    );
  });

  it('모집 마감 일시가 시작 일시보다 늦으면 필드 오류를 제공한다', () => {
    const result = volunteerEventSchema.safeParse({
      ...validEvent,
      recruitmentDeadlineAt: '2026-07-18T10:01',
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.recruitmentDeadlineAt).toContain(
      '모집 마감 일시는 시작 일시보다 늦을 수 없습니다.',
    );
  });

  it('유효하지 않은 날짜 문자열을 거부한다', () => {
    const result = volunteerEventSchema.safeParse({
      ...validEvent,
      startAt: 'not-a-date',
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.startAt).toContain(
      '올바른 날짜와 시간을 입력해 주세요.',
    );
  });

  it.each([
    ['title', '', '봉사 제목을 입력해 주세요.'],
    ['location', '', '장소를 입력해 주세요.'],
    ['capacity', 0, '모집 인원은 1명 이상이어야 합니다.'],
    ['capacity', 1.5, '모집 인원은 정수로 입력해 주세요.'],
    ['description', '짧은 설명', '활동 내용을 10자 이상 입력해 주세요.'],
  ] as const)('%s 필드의 잘못된 값을 거부한다', (field, value, message) => {
    const result = volunteerEventSchema.safeParse({
      ...validEvent,
      [field]: value,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors[field]).toContain(message);
  });
});
