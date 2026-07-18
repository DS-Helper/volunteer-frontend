export const VOLUNTEER_APPLICATION_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELED',
] as const

export type VolunteerApplicationStatus =
  (typeof VOLUNTEER_APPLICATION_STATUSES)[number]

export const VOLUNTEER_MEMBER_STATUSES = [
  'ACTIVE',
  'SUSPENDED',
  'WITHDRAWN',
] as const

export type VolunteerMemberStatus = (typeof VOLUNTEER_MEMBER_STATUSES)[number]

export const VOLUNTEER_EVENT_STATUSES = [
  'DRAFT',
  'OPEN',
  'CLOSED',
  'COMPLETED',
  'CANCELED',
] as const

export type VolunteerEventStatus = (typeof VOLUNTEER_EVENT_STATUSES)[number]

export const VOLUNTEER_EVENT_VISIBILITIES = ['PUBLIC', 'PRIVATE'] as const

export type VolunteerEventVisibility =
  (typeof VOLUNTEER_EVENT_VISIBILITIES)[number]

export const VOLUNTEER_EVENT_CLOSE_REASONS = [
  'CAPACITY',
  'MANUAL',
  'DEADLINE',
] as const

export type VolunteerEventCloseReason =
  (typeof VOLUNTEER_EVENT_CLOSE_REASONS)[number]

export const VOLUNTEER_PARTICIPATION_STATUSES = [
  'APPLIED',
  'CANCELED',
  'ATTENDED',
  'ABSENT',
] as const

export type VolunteerParticipationStatus =
  (typeof VOLUNTEER_PARTICIPATION_STATUSES)[number]

export const VOLUNTEER_GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const

export type VolunteerGender = (typeof VOLUNTEER_GENDERS)[number]

export const VOLUNTEER_APPLICATION_STATUS_LABEL = {
  PENDING: '승인 대기',
  APPROVED: '가입 승인',
  REJECTED: '가입 반려',
  CANCELED: '신청 취소',
} as const satisfies Record<VolunteerApplicationStatus, string>

export const VOLUNTEER_MEMBER_STATUS_LABEL = {
  ACTIVE: '활동중',
  SUSPENDED: '활동정지',
  WITHDRAWN: '탈퇴',
} as const satisfies Record<VolunteerMemberStatus, string>

export const VOLUNTEER_EVENT_STATUS_LABEL = {
  DRAFT: '작성중',
  OPEN: '모집중',
  CLOSED: '모집마감',
  COMPLETED: '완료',
  CANCELED: '일정 취소',
} as const satisfies Record<VolunteerEventStatus, string>

export const VOLUNTEER_EVENT_VISIBILITY_LABEL = {
  PUBLIC: '공개',
  PRIVATE: '비공개',
} as const satisfies Record<VolunteerEventVisibility, string>

export const VOLUNTEER_EVENT_CLOSE_REASON_LABEL = {
  CAPACITY: '정원 마감',
  MANUAL: '수동 마감',
  DEADLINE: '모집 기한 마감',
} as const satisfies Record<VolunteerEventCloseReason, string>

export const VOLUNTEER_PARTICIPATION_STATUS_LABEL = {
  APPLIED: '참여 신청',
  CANCELED: '참여 취소',
  ATTENDED: '출석',
  ABSENT: '불참',
} as const satisfies Record<VolunteerParticipationStatus, string>

export const VOLUNTEER_EVENT_TYPE_LABEL: Record<string, string> = {
  ENVIRONMENT: '환경·플로깅',
  WELFARE: '이웃 돌봄',
  EDUCATION: '교육·디지털 지원',
  ANIMAL: '동물 보호',
  SAFETY: '지역 안전',
  COMMUNITY: '봉사단 운영',
}

export const VOLUNTEER_GENDER_LABEL = {
  MALE: '남성',
  FEMALE: '여성',
  OTHER: '기타',
} as const satisfies Record<VolunteerGender, string>

export const APPLICATION_STATUS_LABEL = VOLUNTEER_APPLICATION_STATUS_LABEL
export const MEMBER_STATUS_LABEL = VOLUNTEER_MEMBER_STATUS_LABEL
export const EVENT_STATUS_LABEL = VOLUNTEER_EVENT_STATUS_LABEL
export const EVENT_VISIBILITY_LABEL = VOLUNTEER_EVENT_VISIBILITY_LABEL
export const EVENT_CLOSE_REASON_LABEL = VOLUNTEER_EVENT_CLOSE_REASON_LABEL
export const PARTICIPATION_STATUS_LABEL =
  VOLUNTEER_PARTICIPATION_STATUS_LABEL
export const GENDER_LABEL = VOLUNTEER_GENDER_LABEL
