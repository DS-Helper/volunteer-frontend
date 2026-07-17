import { describe, expect, it } from 'vitest';

import {
  VOLUNTEER_API_ERROR_CODES,
  VOLUNTEER_API_ERROR_MESSAGE,
  VOLUNTEER_APPLICATION_STATUSES,
  VOLUNTEER_APPLICATION_STATUS_LABEL,
  VOLUNTEER_EVENT_CLOSE_REASONS,
  VOLUNTEER_EVENT_CLOSE_REASON_LABEL,
  VOLUNTEER_EVENT_STATUSES,
  VOLUNTEER_EVENT_STATUS_LABEL,
  VOLUNTEER_EVENT_VISIBILITIES,
  VOLUNTEER_EVENT_VISIBILITY_LABEL,
  VOLUNTEER_GENDERS,
  VOLUNTEER_GENDER_LABEL,
  VOLUNTEER_MEMBER_STATUSES,
  VOLUNTEER_MEMBER_STATUS_LABEL,
  VOLUNTEER_PARTICIPATION_STATUSES,
  VOLUNTEER_PARTICIPATION_STATUS_LABEL,
} from '@/features/volunteer/types';

const statusGroups: ReadonlyArray<{
  values: readonly string[];
  labels: Readonly<Record<string, string>>;
}> = [
  {
    values: VOLUNTEER_APPLICATION_STATUSES,
    labels: VOLUNTEER_APPLICATION_STATUS_LABEL,
  },
  {
    values: VOLUNTEER_MEMBER_STATUSES,
    labels: VOLUNTEER_MEMBER_STATUS_LABEL,
  },
  {
    values: VOLUNTEER_EVENT_STATUSES,
    labels: VOLUNTEER_EVENT_STATUS_LABEL,
  },
  {
    values: VOLUNTEER_EVENT_VISIBILITIES,
    labels: VOLUNTEER_EVENT_VISIBILITY_LABEL,
  },
  {
    values: VOLUNTEER_EVENT_CLOSE_REASONS,
    labels: VOLUNTEER_EVENT_CLOSE_REASON_LABEL,
  },
  {
    values: VOLUNTEER_PARTICIPATION_STATUSES,
    labels: VOLUNTEER_PARTICIPATION_STATUS_LABEL,
  },
  { values: VOLUNTEER_GENDERS, labels: VOLUNTEER_GENDER_LABEL },
];

describe('봉사 도메인 상태 계약', () => {
  it('모든 상태값에 빠짐없이 한국어 라벨을 제공한다', () => {
    for (const { values, labels } of statusGroups) {
      expect(new Set(Object.keys(labels))).toEqual(new Set(values));
      for (const value of values) {
        expect(labels[value]).toBeTruthy();
      }
    }
  });

  it('핵심 일정과 참여 상태 라벨을 API 영문값과 분리한다', () => {
    expect(VOLUNTEER_EVENT_STATUS_LABEL).toMatchObject({
      OPEN: '모집중',
      CLOSED: '모집마감',
      COMPLETED: '완료',
      CANCELED: '일정 취소',
    });
    expect(VOLUNTEER_PARTICIPATION_STATUS_LABEL).toMatchObject({
      APPLIED: '참여 신청',
      ATTENDED: '출석',
      ABSENT: '불참',
    });
  });
});

describe('봉사 API 오류 계약', () => {
  it('오류 코드가 중복되지 않고 모든 코드에 메시지가 존재한다', () => {
    expect(new Set(VOLUNTEER_API_ERROR_CODES).size).toBe(
      VOLUNTEER_API_ERROR_CODES.length,
    );
    expect(new Set(Object.keys(VOLUNTEER_API_ERROR_MESSAGE))).toEqual(
      new Set(VOLUNTEER_API_ERROR_CODES),
    );
  });

  it('업무 오류를 사용자가 행동할 수 있는 문구로 매핑한다', () => {
    expect(VOLUNTEER_API_ERROR_MESSAGE.VOLUNTEER_EVENT_CAPACITY_FULL).toBe(
      '봉사 모집 인원이 마감되었습니다.',
    );
    expect(VOLUNTEER_API_ERROR_MESSAGE.VOLUNTEER_TIME_CONFLICT).toBe(
      '같은 시간대에 신청한 봉사 일정이 있습니다.',
    );
    expect(
      VOLUNTEER_API_ERROR_MESSAGE.VOLUNTEER_CANCEL_DEADLINE_EXPIRED,
    ).toContain('관리자에게 문의해 주세요.');
  });
});
