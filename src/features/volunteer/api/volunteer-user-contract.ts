import type {
  MyCompletedVolunteerEvent,
  MyUpcomingVolunteerEvent,
  MyVolunteerSummary,
  VolunteerApplication,
  VolunteerEventDetail,
  VolunteerEventListItem,
  VolunteerEventPage,
  VolunteerParticipation,
} from '@/features/volunteer/types'

export type BackendApplication = Omit<VolunteerApplication, 'id' | 'updatedAt' | 'reviewedAt'> & {
  applicationId: string
}

type BackendEventListItem = Omit<
  VolunteerEventListItem,
  'id' | 'typeLabel' | 'recruitmentDeadlineAt' | 'closeReason'
> & { eventId: string }

export type BackendEventDetail = Omit<
  VolunteerEventDetail,
  | 'id'
  | 'typeLabel'
  | 'closeReason'
  | 'supplies'
  | 'precautions'
  | 'createdAt'
  | 'updatedAt'
> & {
  eventId: string
  supplies: string
  precautions: string
}

export type BackendParticipation = Omit<VolunteerParticipation, 'id' | 'eventId'> & {
  participationId: string
  eventId: string
}

type BackendMemberEvent = {
  eventId: string
  title: string
  imageUrl: string | null
  startAt: string
  endAt: string
  location: string
  participationStatus: MyUpcomingVolunteerEvent['myParticipationStatus']
  recognizedMinutes: number | null
  canCancel: boolean
}

export type BackendMemberPage = { content: BackendMemberEvent[]; page: unknown }

export type BackendEventPage = {
  content: BackendEventListItem[]
  page: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

function isFrontendEventPage(
  value: BackendEventPage | VolunteerEventPage,
): value is VolunteerEventPage {
  return typeof value.page === 'number'
}

export function normalizeApplication(
  value: BackendApplication | VolunteerApplication,
): VolunteerApplication {
  if ('id' in value) return value
  return { ...value, id: value.applicationId, updatedAt: value.createdAt, reviewedAt: null }
}

function normalizeEventListItem(value: BackendEventListItem): VolunteerEventListItem {
  return {
    ...value,
    id: value.eventId,
    typeLabel: value.type,
    recruitmentDeadlineAt: '',
    closeReason: null,
  }
}

export function normalizeEventPage(value: {
  content: BackendEventListItem[]
  page: BackendEventPage['page']
} | VolunteerEventPage): VolunteerEventPage {
  if (isFrontendEventPage(value)) return value
  return {
    content: value.content.map(normalizeEventListItem),
    page: value.page.page,
    size: value.page.size,
    totalElements: value.page.totalElements,
    totalPages: value.page.totalPages,
  }
}

export function normalizeEventDetail(
  value: BackendEventDetail | VolunteerEventDetail,
): VolunteerEventDetail {
  if ('id' in value) return value
  return {
    ...value,
    id: value.eventId,
    typeLabel: value.type,
    closeReason: null,
    supplies: value.supplies ? [value.supplies] : [],
    precautions: value.precautions ? [value.precautions] : [],
    createdAt: '',
    updatedAt: '',
  }
}

export function normalizeParticipation(
  value: BackendParticipation | VolunteerParticipation,
): VolunteerParticipation {
  if ('id' in value) return value
  return { ...value, id: value.participationId }
}

function normalizeMemberEvent(value: BackendMemberEvent): MyUpcomingVolunteerEvent {
  return {
    id: value.eventId,
    participationId: value.eventId,
    title: value.title,
    type: '',
    typeLabel: '봉사 활동',
    imageUrl: value.imageUrl,
    startAt: value.startAt,
    endAt: value.endAt,
    recruitmentDeadlineAt: '',
    location: value.location,
    capacity: 0,
    participantCount: 0,
    status: 'OPEN',
    closeReason: null,
    myParticipationStatus: value.participationStatus,
    capabilities: { canApply: false, canCancel: value.canCancel, canViewParticipants: false },
  }
}

export function normalizeUpcomingPage(
  value: BackendMemberPage | MyUpcomingVolunteerEvent[],
): MyUpcomingVolunteerEvent[] {
  if (Array.isArray(value)) return value
  return value.content.map(normalizeMemberEvent)
}

export function normalizeCompletedPage(
  value: BackendMemberPage | MyCompletedVolunteerEvent[],
): MyCompletedVolunteerEvent[] {
  if (Array.isArray(value)) return value
  return value.content.map((event) => ({
    ...normalizeMemberEvent(event),
    recognizedHours: (event.recognizedMinutes ?? 0) / 60,
  }))
}

export function normalizeSummary(value: {
  participationCount: number
  totalMinutes: number
} | MyVolunteerSummary): MyVolunteerSummary {
  if ('totalParticipationCount' in value) return value
  return {
    totalParticipationCount: value.participationCount,
    totalHours: value.totalMinutes / 60,
  }
}
