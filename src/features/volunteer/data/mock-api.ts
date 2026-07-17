import type {
  AdminVolunteerApplication,
  AdminVolunteerApplicationPage,
  AdminVolunteerEvent,
  AdminVolunteerEventImageUploadResponse,
  AdminVolunteerEventPage,
  AdminVolunteerEventParticipations,
  AdminVolunteerMemberDetail,
  AdminVolunteerMemberListItem,
  AdminVolunteerMemberPage,
  CancelVolunteerEventRequest,
  ChangeVolunteerMemberStatusRequest,
  CreateVolunteerEventRequest,
  MyCompletedVolunteerEvent,
  MyUpcomingVolunteerEvent,
  RejectVolunteerApplicationRequest,
  SaveVolunteerAttendanceRequest,
  SaveVolunteerAttendanceResponse,
  UpdateVolunteerEventRequest,
  VolunteerApplication,
  VolunteerApplicationInput,
  VolunteerEventDetail,
  VolunteerEventListItem,
  VolunteerEventPage,
  VolunteerIntroduction,
  VolunteerParticipation,
} from '@/features/volunteer/types'
import type { ApiQuery, MockApiRequest, PageResponse } from '@/lib/api'
import { ApiError, type ApiFieldError } from '@/lib/errors'

import {
  adminParticipationFixtures,
  currentApplicationIdByScenario,
  currentMemberIdByScenario,
  DEFAULT_VOLUNTEER_MOCK_SCENARIO,
  maskedParticipantFixtures,
  MOCK_CURRENT_ADMIN_ID,
  myCompletedVolunteerEventFixtures,
  myVolunteerSummaryFixture,
  volunteerApplicationFixtures,
  volunteerEventFixtures,
  volunteerIntroductionFixture,
  volunteerMemberFixtures,
  volunteerParticipationFixtures,
  type VolunteerMockScenario,
} from './fixtures'

const MOCK_NOW = '2026-07-12T03:00:00.000Z'
const MOCK_DELAY_MS = 80

interface VolunteerMockState {
  applications: AdminVolunteerApplication[]
  currentApplicationId: number | null
  members: AdminVolunteerMemberDetail[]
  currentMemberId: number | null
  events: AdminVolunteerEvent[]
  participations: VolunteerParticipation[]
  maskedParticipants: typeof maskedParticipantFixtures
  adminParticipations: typeof adminParticipationFixtures
  completedEvents: MyCompletedVolunteerEvent[]
  summary: typeof myVolunteerSummaryFixture
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function isVolunteerMockScenario(value: string): value is VolunteerMockScenario {
  return [
    'ACTIVE_MEMBER',
    'NEW_APPLICANT',
    'PENDING_APPLICATION',
    'REJECTED_APPLICATION',
    'SUSPENDED_MEMBER',
  ].includes(value)
}

const configuredScenario =
  process.env.NEXT_PUBLIC_VOLUNTEER_MOCK_SCENARIO?.trim() ?? ''

let activeScenario: VolunteerMockScenario = isVolunteerMockScenario(
  configuredScenario,
)
  ? configuredScenario
  : DEFAULT_VOLUNTEER_MOCK_SCENARIO

function createState(scenario: VolunteerMockScenario): VolunteerMockState {
  const isActiveMember = scenario === 'ACTIVE_MEMBER'

  return {
    applications: clone(volunteerApplicationFixtures),
    currentApplicationId: currentApplicationIdByScenario[scenario],
    members: clone(volunteerMemberFixtures),
    currentMemberId: currentMemberIdByScenario[scenario],
    events: clone(volunteerEventFixtures).map((event) => ({
      ...event,
      imageFileId: event.imageFileId ?? `mock-event-image-${event.id}`,
    })),
    participations: isActiveMember ? clone(volunteerParticipationFixtures) : [],
    maskedParticipants: clone(maskedParticipantFixtures),
    adminParticipations: clone(adminParticipationFixtures),
    completedEvents: isActiveMember
      ? clone(myCompletedVolunteerEventFixtures)
      : [],
    summary: isActiveMember
      ? clone(myVolunteerSummaryFixture)
      : { totalParticipationCount: 0, totalHours: 0 },
  }
}

let state = createState(activeScenario)

function throwMockError(
  code: string,
  message: string,
  status: number,
  fieldErrors: ApiFieldError[] = [],
): never {
  throw new ApiError({ code, message, status, fieldErrors })
}

function firstQueryValue(query: ApiQuery, key: string): string | undefined {
  const value = query[key]
  if (Array.isArray(value)) {
    return value[0] === undefined ? undefined : String(value[0])
  }
  return value === undefined || value === null ? undefined : String(value)
}

function paginate<T>(items: T[], query: ApiQuery): PageResponse<T> {
  const parsedPage = Number(firstQueryValue(query, 'page') ?? 0)
  const parsedSize = Number(firstQueryValue(query, 'size') ?? 20)
  const page = Number.isInteger(parsedPage) && parsedPage >= 0 ? parsedPage : 0
  const size = Number.isInteger(parsedSize) && parsedSize > 0 ? parsedSize : 20
  const totalElements = items.length
  const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / size)

  return {
    content: items.slice(page * size, page * size + size),
    page,
    size,
    totalElements,
    totalPages,
  }
}

function getApplicationCapabilities(
  status: AdminVolunteerApplication['status'],
): VolunteerApplication['capabilities'] {
  return {
    canEdit: status === 'PENDING',
    canCancel: status === 'PENDING',
    canReapply: status === 'REJECTED' || status === 'CANCELED',
  }
}

function toUserApplication(
  application: AdminVolunteerApplication,
): VolunteerApplication {
  return {
    id: application.id,
    name: application.name,
    phone: application.phone,
    birthDate: application.birthDate,
    gender: application.gender,
    neighborhood: application.neighborhood,
    preferredActivities: application.preferredActivities,
    motivation: application.motivation,
    status: application.status,
    rejectionReason: application.rejectionReason,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    reviewedAt: application.reviewedAt,
    capabilities: getApplicationCapabilities(application.status),
  }
}

function getCurrentApplication(): AdminVolunteerApplication | null {
  if (state.currentApplicationId === null) {
    return null
  }
  return (
    state.applications.find(({ id }) => id === state.currentApplicationId) ?? null
  )
}

function getCurrentMember(): AdminVolunteerMemberDetail | null {
  if (state.currentMemberId === null) {
    return null
  }
  return state.members.find(({ id }) => id === state.currentMemberId) ?? null
}

function getCurrentParticipation(eventId: string | number): VolunteerParticipation | null {
  return (
    state.participations.find(
      (participation) => String(participation.eventId) === String(eventId),
    ) ?? null
  )
}

function toUserEvent(event: AdminVolunteerEvent): VolunteerEventDetail {
  const participation = getCurrentParticipation(event.id)
  const member = getCurrentMember()
  const isActiveMember = member?.status === 'ACTIVE'
  const canApply =
    isActiveMember &&
    event.visibility === 'PUBLIC' &&
    event.status === 'OPEN' &&
    event.participantCount < event.capacity &&
    participation?.status !== 'APPLIED'
  const canCancel =
    isActiveMember &&
    participation?.status === 'APPLIED' &&
    new Date(MOCK_NOW).getTime() <=
      new Date(event.startAt).getTime() - 2 * 60 * 60 * 1000

  return {
    id: event.id,
    title: event.title,
    type: event.type,
    typeLabel: event.typeLabel,
    imageUrl: event.imageUrl,
    startAt: event.startAt,
    endAt: event.endAt,
    recruitmentDeadlineAt: event.recruitmentDeadlineAt,
    location: event.location,
    capacity: event.capacity,
    participantCount: event.participantCount,
    status: event.status,
    closeReason: event.closeReason,
    myParticipationStatus: participation?.status ?? null,
    capabilities: {
      canApply,
      canCancel,
      canViewParticipants:
        event.visibility === 'PUBLIC' && event.status !== 'DRAFT',
    },
    description: event.description,
    supplies: event.supplies,
    precautions: event.precautions,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  }
}

function toEventListItem(event: AdminVolunteerEvent): VolunteerEventListItem {
  const detail = toUserEvent(event)
  return {
    id: detail.id,
    title: detail.title,
    type: detail.type,
    typeLabel: detail.typeLabel,
    imageUrl: detail.imageUrl,
    startAt: detail.startAt,
    endAt: detail.endAt,
    recruitmentDeadlineAt: detail.recruitmentDeadlineAt,
    location: detail.location,
    capacity: detail.capacity,
    participantCount: detail.participantCount,
    status: detail.status,
    closeReason: detail.closeReason,
    myParticipationStatus: detail.myParticipationStatus,
    capabilities: detail.capabilities,
  }
}

function findEvent(eventId: string | number): AdminVolunteerEvent {
  const event = state.events.find(({ id }) => String(id) === String(eventId))
  if (!event) {
    throwMockError('NOT_FOUND', '봉사 일정을 찾을 수 없습니다.', 404)
  }
  return event
}

function findApplication(applicationId: string | number): AdminVolunteerApplication {
  const application = state.applications.find(({ id }) => String(id) === String(applicationId))
  if (!application) {
    throwMockError('NOT_FOUND', '가입 신청을 찾을 수 없습니다.', 404)
  }
  return application
}

function findMember(memberId: string | number): AdminVolunteerMemberDetail {
  const member = state.members.find(({ id }) => String(id) === String(memberId))
  if (!member) {
    throwMockError('NOT_FOUND', '봉사단원을 찾을 수 없습니다.', 404)
  }
  return member
}

async function parseMultipartJson<T>(
  body: unknown,
  fieldName: string,
): Promise<T> {
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    const value = body.get(fieldName)
    if (typeof value === 'string') {
      return JSON.parse(value) as T
    }
    if (typeof Blob !== 'undefined' && value instanceof Blob) {
      return JSON.parse(await value.text()) as T
    }
  }

  if (typeof body === 'object' && body !== null && fieldName in body) {
    return (body as Record<string, T>)[fieldName]
  }

  throwMockError(
    'INVALID_REQUEST',
    '전송된 폼 데이터를 확인해 주세요.',
    400,
  )
}

function assertObject<T>(body: unknown): T {
  if (typeof body !== 'object' || body === null) {
    throwMockError('INVALID_REQUEST', '입력값을 확인해 주세요.', 400)
  }
  return body as T
}

function assertApplicationInput(input: VolunteerApplicationInput): void {
  const fieldErrors: ApiFieldError[] = []
  if (!input.name?.trim()) {
    fieldErrors.push({ field: 'name', message: '이름을 입력해 주세요.' })
  }
  if (!input.phone?.trim() || input.phone.trim().length < 10) {
    fieldErrors.push({
      field: 'phone',
      message: '연락처를 10자 이상 입력해 주세요.',
    })
  }
  if (!input.preferredActivities?.length) {
    fieldErrors.push({
      field: 'preferredActivities',
      message: '희망 활동을 한 개 이상 선택해 주세요.',
    })
  }
  if (!input.motivation?.trim() || input.motivation.trim().length < 20) {
    fieldErrors.push({
      field: 'motivation',
      message: '지원동기를 20자 이상 입력해 주세요.',
    })
  }
  if (fieldErrors.length > 0) {
    throwMockError(
      'INVALID_REQUEST',
      '입력값을 확인해 주세요.',
      400,
      fieldErrors,
    )
  }
}

function eventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ENVIRONMENT: '환경·플로깅',
    WELFARE: '이웃 돌봄',
    EDUCATION: '교육·디지털 지원',
    ANIMAL: '동물 보호',
    SAFETY: '지역 안전',
    COMMUNITY: '봉사단 운영',
  }
  return labels[type] ?? type
}

function hasTimeConflict(target: AdminVolunteerEvent): boolean {
  return state.participations.some((participation) => {
    if (participation.status !== 'APPLIED' || participation.eventId === target.id) {
      return false
    }
    const existing = state.events.find(({ id }) => id === participation.eventId)
    return (
      existing !== undefined &&
      new Date(existing.startAt).getTime() < new Date(target.endAt).getTime() &&
      new Date(existing.endAt).getTime() > new Date(target.startAt).getTime()
    )
  })
}

function updateMemberCapabilities(member: AdminVolunteerMemberDetail): void {
  member.capabilities = {
    canActivate: member.status === 'SUSPENDED',
    canSuspend: member.status === 'ACTIVE',
    canWithdraw: member.status !== 'WITHDRAWN',
  }
}

function getIntroduction(): VolunteerIntroduction {
  const application = getCurrentApplication()
  const member = getCurrentMember()
  const canApply =
    application === null ||
    application.status === 'REJECTED' ||
    application.status === 'CANCELED'

  return {
    ...clone(volunteerIntroductionFixture),
    applicationStatus: application?.status ?? null,
    capabilities: {
      canApply,
      canViewApplicationStatus: application !== null,
      canViewEvents: member?.status === 'ACTIVE',
    },
  }
}

async function createApplication(body: unknown): Promise<VolunteerApplication> {
  const existing = getCurrentApplication()
  if (existing?.status === 'PENDING' || existing?.status === 'APPROVED') {
    throwMockError(
      'VOLUNTEER_APPLICATION_ALREADY_EXISTS',
      '이미 처리 중이거나 승인된 가입 신청이 있습니다.',
      409,
    )
  }

  const input = await parseMultipartJson<VolunteerApplicationInput>(
    body,
    'application',
  )
  assertApplicationInput(input)
  const id = Math.max(0, ...state.applications.map(({ id }) => Number(id))) + 1
  const application: AdminVolunteerApplication = {
    ...input,
    id,
    userId: 19999,
    status: 'PENDING',
    rejectionReason: null,
    createdAt: MOCK_NOW,
    updatedAt: MOCK_NOW,
    reviewedAt: null,
    photoUrl: `/api/v1/admin/volunteer/applications/${id}/photo`,
    adminMemo: null,
    reviewedBy: null,
    capabilities: { canApprove: true, canReject: true },
  }
  state.applications.unshift(application)
  state.currentApplicationId = id
  return toUserApplication(application)
}

async function updateApplication(
  applicationId: number,
  body: unknown,
): Promise<VolunteerApplication> {
  const application = findApplication(applicationId)
  if (
    application.id !== state.currentApplicationId ||
    application.status !== 'PENDING'
  ) {
    throwMockError(
      'VOLUNTEER_APPLICATION_INVALID_STATE',
      '승인 대기 중인 본인의 신청만 수정할 수 있습니다.',
      409,
    )
  }
  const input = await parseMultipartJson<VolunteerApplicationInput>(
    body,
    'application',
  )
  assertApplicationInput(input)
  Object.assign(application, input, { updatedAt: MOCK_NOW })
  return toUserApplication(application)
}

function cancelApplication(applicationId: number): VolunteerApplication {
  const application = findApplication(applicationId)
  if (
    application.id !== state.currentApplicationId ||
    application.status !== 'PENDING'
  ) {
    throwMockError(
      'VOLUNTEER_APPLICATION_INVALID_STATE',
      '승인 대기 중인 본인의 신청만 취소할 수 있습니다.',
      409,
    )
  }
  application.status = 'CANCELED'
  application.updatedAt = MOCK_NOW
  application.capabilities = { canApprove: false, canReject: false }
  return toUserApplication(application)
}

function getUserEventPage(query: ApiQuery): VolunteerEventPage {
  const status = firstQueryValue(query, 'status')
  const events = state.events
    .filter(({ visibility }) => visibility === 'PUBLIC')
    .filter((event) => !status || event.status === status)
    .sort(
      (left, right) =>
        new Date(left.startAt).getTime() - new Date(right.startAt).getTime(),
    )
    .map(toEventListItem)
  return paginate(events, query)
}

function applyEvent(eventId: number): VolunteerParticipation {
  const member = getCurrentMember()
  if (!member || member.status !== 'ACTIVE') {
    throwMockError(
      'VOLUNTEER_MEMBER_NOT_ACTIVE',
      '현재 봉사 일정에 참여할 수 없는 상태입니다. 관리자에게 문의해 주세요.',
      403,
    )
  }
  const event = findEvent(eventId)
  const existing = getCurrentParticipation(eventId)
  if (existing?.status === 'APPLIED') {
    throwMockError(
      'VOLUNTEER_PARTICIPATION_ALREADY_EXISTS',
      '이미 신청한 봉사 일정입니다.',
      409,
    )
  }
  if (
    event.status !== 'OPEN' ||
    event.participantCount >= event.capacity
  ) {
    throwMockError(
      'VOLUNTEER_EVENT_CAPACITY_FULL',
      '봉사 모집 인원이 마감되었습니다.',
      409,
    )
  }
  if (hasTimeConflict(event)) {
    throwMockError(
      'VOLUNTEER_TIME_CONFLICT',
      '같은 시간대에 신청한 봉사 일정이 있습니다.',
      409,
    )
  }

  const participation: VolunteerParticipation = existing ?? {
    id: Math.max(7000, ...state.participations.map(({ id }) => Number(id))) + 1,
    eventId,
    status: 'APPLIED',
    appliedAt: MOCK_NOW,
    canceledAt: null,
  }
  participation.status = 'APPLIED'
  participation.appliedAt = MOCK_NOW
  participation.canceledAt = null
  if (!existing) {
    state.participations.push(participation)
  }
  event.participantCount += 1
  state.maskedParticipants[Number(eventId)] = [
    ...(state.maskedParticipants[Number(eventId)] ?? []),
    { maskedName: `${member.name.slice(0, -1)}*` },
  ]
  if (event.participantCount >= event.capacity) {
    event.status = 'CLOSED'
    event.closeReason = 'CAPACITY'
  }
  return clone(participation)
}

function cancelEventParticipation(eventId: number): VolunteerParticipation {
  const event = findEvent(eventId)
  const participation = getCurrentParticipation(eventId)
  if (!participation || participation.status !== 'APPLIED') {
    throwMockError(
      'VOLUNTEER_PARTICIPATION_NOT_FOUND',
      '취소할 참여 신청 내역을 찾을 수 없습니다.',
      404,
    )
  }
  if (!toUserEvent(event).capabilities.canCancel) {
    throwMockError(
      'VOLUNTEER_CANCEL_DEADLINE_EXPIRED',
      '취소 가능 시간이 지났습니다. 관리자에게 문의해 주세요.',
      409,
    )
  }
  participation.status = 'CANCELED'
  participation.canceledAt = MOCK_NOW
  event.participantCount = Math.max(0, event.participantCount - 1)
  if (event.status === 'CLOSED' && event.closeReason === 'CAPACITY') {
    event.status = 'OPEN'
    event.closeReason = null
  }
  return clone(participation)
}

function getUpcomingEvents(): MyUpcomingVolunteerEvent[] {
  return state.participations
    .filter(({ status }) => status === 'APPLIED')
    .map((participation) => {
      const event = findEvent(Number(participation.eventId))
      return { ...toEventListItem(event), participationId: participation.id }
    })
    .filter(({ startAt }) => new Date(startAt).getTime() > new Date(MOCK_NOW).getTime())
    .sort(
      (left, right) =>
        new Date(left.startAt).getTime() - new Date(right.startAt).getTime(),
    )
}

function filterApplications(query: ApiQuery): AdminVolunteerApplicationPage {
  const name = firstQueryValue(query, 'name')?.toLowerCase()
  const phone = firstQueryValue(query, 'phone')?.replace(/-/g, '')
  const status = firstQueryValue(query, 'status')
  const appliedFrom = firstQueryValue(query, 'appliedFrom')
  const appliedTo = firstQueryValue(query, 'appliedTo')
  const filtered = state.applications.filter((application) => {
    const createdDate = application.createdAt.slice(0, 10)
    return (
      (!name || application.name.toLowerCase().includes(name)) &&
      (!phone || application.phone.replace(/-/g, '').includes(phone)) &&
      (!status || application.status === status) &&
      (!appliedFrom || createdDate >= appliedFrom) &&
      (!appliedTo || createdDate <= appliedTo)
    )
  })
  return paginate(filtered, query)
}

function approveApplication(applicationId: number): AdminVolunteerApplication {
  const application = findApplication(applicationId)
  if (application.status !== 'PENDING') {
    throwMockError(
      'VOLUNTEER_APPLICATION_INVALID_STATE',
      '승인 대기 중인 신청만 승인할 수 있습니다.',
      409,
    )
  }
  application.status = 'APPROVED'
  application.reviewedAt = MOCK_NOW
  application.updatedAt = MOCK_NOW
  application.reviewedBy = MOCK_CURRENT_ADMIN_ID
  application.capabilities = { canApprove: false, canReject: false }

  if (state.currentApplicationId === applicationId && state.currentMemberId === null) {
    const id = Math.max(200, ...state.members.map((member) => Number(member.id))) + 1
    const member: AdminVolunteerMemberDetail = {
      id,
      userId: application.userId,
      name: application.name,
      gender: application.gender,
      phone: application.phone,
      joinedAt: MOCK_NOW,
      status: 'ACTIVE',
      totalParticipationCount: 0,
      totalHours: 0,
      capabilities: { canActivate: false, canSuspend: true, canWithdraw: true },
      application,
      upcomingEvents: [],
      attendanceHistory: [],
      absenceHistory: [],
      cancellationHistory: [],
      adminMemo: application.adminMemo,
      statusHistory: [
        {
          id: 8999,
          previousStatus: null,
          nextStatus: 'ACTIVE',
          reason: '가입 신청 승인',
          changedBy: MOCK_CURRENT_ADMIN_ID,
          changedAt: MOCK_NOW,
        },
      ],
    }
    state.members.unshift(member)
    state.currentMemberId = id
  }
  return clone(application)
}

function rejectApplication(
  applicationId: number,
  request: RejectVolunteerApplicationRequest,
): AdminVolunteerApplication {
  const application = findApplication(applicationId)
  if (application.status !== 'PENDING') {
    throwMockError(
      'VOLUNTEER_APPLICATION_INVALID_STATE',
      '승인 대기 중인 신청만 반려할 수 있습니다.',
      409,
    )
  }
  if (!request.rejectionReason?.trim()) {
    throwMockError('INVALID_REQUEST', '반려 사유를 입력해 주세요.', 400, [
      { field: 'rejectionReason', message: '반려 사유를 입력해 주세요.' },
    ])
  }
  application.status = 'REJECTED'
  application.rejectionReason = request.rejectionReason.trim()
  application.adminMemo = request.adminMemo?.trim() || null
  application.reviewedAt = MOCK_NOW
  application.updatedAt = MOCK_NOW
  application.reviewedBy = MOCK_CURRENT_ADMIN_ID
  application.capabilities = { canApprove: false, canReject: false }
  return clone(application)
}

function filterMembers(query: ApiQuery): AdminVolunteerMemberPage {
  const keyword = firstQueryValue(query, 'keyword')?.toLowerCase()
  const status = firstQueryValue(query, 'status')
  const gender = firstQueryValue(query, 'gender')
  const members: AdminVolunteerMemberListItem[] = state.members
    .filter(
      (member) =>
        (!keyword ||
          member.name.toLowerCase().includes(keyword) ||
          member.phone.includes(keyword)) &&
        (!status || member.status === status) &&
        (!gender || member.gender === gender),
    )
    .map((member) => ({
      id: member.id,
      userId: member.userId,
      name: member.name,
      gender: member.gender,
      phone: member.phone,
      joinedAt: member.joinedAt,
      status: member.status,
      totalParticipationCount: member.totalParticipationCount,
      totalHours: member.totalHours,
      capabilities: member.capabilities,
    }))
  return paginate(members, query)
}

function changeMemberStatus(
  memberId: number,
  nextStatus: AdminVolunteerMemberDetail['status'],
  body: unknown,
): AdminVolunteerMemberDetail {
  const request = assertObject<ChangeVolunteerMemberStatusRequest>(body)
  if (!request.reason?.trim()) {
    throwMockError('INVALID_REQUEST', '상태 변경 사유를 입력해 주세요.', 400, [
      { field: 'reason', message: '상태 변경 사유를 입력해 주세요.' },
    ])
  }
  const member = findMember(memberId)
  const previousStatus = member.status
  member.status = nextStatus
  updateMemberCapabilities(member)
  member.statusHistory.unshift({
    id: Math.max(8000, ...member.statusHistory.map(({ id }) => Number(id))) + 1,
    previousStatus,
    nextStatus,
    reason: request.reason.trim(),
    changedBy: MOCK_CURRENT_ADMIN_ID,
    changedAt: MOCK_NOW,
  })
  return clone(member)
}

function filterAdminEvents(query: ApiQuery): AdminVolunteerEventPage {
  const keyword = firstQueryValue(query, 'keyword')?.toLowerCase()
  const status = firstQueryValue(query, 'status')
  const visibility = firstQueryValue(query, 'visibility')
  const startFrom = firstQueryValue(query, 'startFrom')
  const startTo = firstQueryValue(query, 'startTo')
  const events = state.events.filter((event) => {
    const startDate = event.startAt.slice(0, 10)
    return (
      (!keyword ||
        event.title.toLowerCase().includes(keyword) ||
        event.location.toLowerCase().includes(keyword)) &&
      (!status || event.status === status) &&
      (!visibility || event.visibility === visibility) &&
      (!startFrom || startDate >= startFrom) &&
      (!startTo || startDate <= startTo)
    )
  })
  return paginate(events, query)
}

async function createEvent(body: unknown): Promise<AdminVolunteerEvent> {
  const request = assertObject<CreateVolunteerEventRequest>(body)
  const id = Math.max(0, ...state.events.map(({ id }) => Number(id))) + 1
  const event: AdminVolunteerEvent = {
    ...request,
    supplies: toLineItems(request.supplies),
    precautions: toLineItems(request.precautions),
    id,
    typeLabel: eventTypeLabel(request.type),
    imageUrl: null,
    participantCount: 0,
    closeReason: null,
    myParticipationStatus: null,
    cancelReason: null,
    createdBy: MOCK_CURRENT_ADMIN_ID,
    updatedBy: MOCK_CURRENT_ADMIN_ID,
    createdAt: MOCK_NOW,
    updatedAt: MOCK_NOW,
    capabilities: {
      canApply: false,
      canCancel: request.status === 'OPEN',
      canViewParticipants: request.visibility === 'PUBLIC',
      canEdit: true,
      canOpen: request.status === 'DRAFT',
      canClose: request.status === 'OPEN',
      canManageAttendance: false,
    },
  }
  state.events.unshift(event)
  return clone(event)
}

async function updateEvent(
  eventId: number,
  body: unknown,
): Promise<AdminVolunteerEvent> {
  const event = findEvent(eventId)
  const request = assertObject<UpdateVolunteerEventRequest>(body)
  if (request.capacity < event.participantCount) {
    throwMockError(
      'VOLUNTEER_CAPACITY_BELOW_CURRENT_PARTICIPANTS',
      '현재 참여 인원보다 모집 인원을 적게 설정할 수 없습니다.',
      409,
      [
        {
          field: 'capacity',
          message: '현재 참여 인원보다 모집 인원을 적게 설정할 수 없습니다.',
        },
      ],
    )
  }
  Object.assign(event, request, {
    supplies: toLineItems(request.supplies),
    precautions: toLineItems(request.precautions),
    typeLabel: eventTypeLabel(request.type),
    updatedAt: MOCK_NOW,
    updatedBy: MOCK_CURRENT_ADMIN_ID,
  })
  return clone(event)
}

function toLineItems(value: string | null): string[] {
  return value
    ? value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
    : []
}

async function uploadEventImage(
  body: unknown,
): Promise<AdminVolunteerEventImageUploadResponse> {
  if (typeof FormData === 'undefined' || !(body instanceof FormData)) {
    throwMockError('INVALID_REQUEST', '이미지 파일을 전송해 주세요.', 400)
  }
  const image = body.get('image')
  if (typeof Blob === 'undefined' || !(image instanceof Blob)) {
    throwMockError('INVALID_REQUEST', '이미지 파일을 전송해 주세요.', 400)
  }

  const volunteerFileId = `mock-event-image-${Date.now()}`
  return {
    volunteerFileId,
    s3Key: `volunteer/events/${volunteerFileId}.webp`,
    url: `https://mock.dshelper.kr/${volunteerFileId}.webp`,
    contentType: 'image/webp',
    width: 1200,
    height: 800,
  }
}

function openEvent(eventId: number): AdminVolunteerEvent {
  const event = findEvent(eventId)
  if (event.status !== 'DRAFT' && event.status !== 'CLOSED') {
    throwMockError(
      'VOLUNTEER_EVENT_INVALID_STATE',
      '작성중 또는 모집마감 일정만 모집을 시작할 수 있습니다.',
      409,
    )
  }
  event.status = 'OPEN'
  event.closeReason = null
  event.updatedAt = MOCK_NOW
  event.capabilities.canOpen = false
  event.capabilities.canClose = true
  return clone(event)
}

function closeEvent(eventId: number): AdminVolunteerEvent {
  const event = findEvent(eventId)
  if (event.status !== 'OPEN') {
    throwMockError(
      'VOLUNTEER_EVENT_INVALID_STATE',
      '모집중인 일정만 마감할 수 있습니다.',
      409,
    )
  }
  event.status = 'CLOSED'
  event.closeReason = 'MANUAL'
  event.updatedAt = MOCK_NOW
  event.capabilities.canClose = false
  event.capabilities.canOpen = true
  return clone(event)
}

function cancelAdminEvent(
  eventId: number,
  request: CancelVolunteerEventRequest,
): AdminVolunteerEvent {
  if (!request.reason?.trim()) {
    throwMockError('INVALID_REQUEST', '일정 취소 사유를 입력해 주세요.', 400, [
      { field: 'reason', message: '일정 취소 사유를 입력해 주세요.' },
    ])
  }
  const event = findEvent(eventId)
  if (!['OPEN', 'CLOSED'].includes(event.status)) {
    throwMockError(
      'VOLUNTEER_EVENT_INVALID_STATE',
      '모집중 또는 모집마감 일정만 취소할 수 있습니다.',
      409,
    )
  }
  event.status = 'CANCELED'
  event.cancelReason = request.reason.trim()
  event.updatedAt = MOCK_NOW
  event.capabilities.canOpen = false
  event.capabilities.canClose = false
  event.capabilities.canCancel = false
  return clone(event)
}

function getEventParticipations(
  eventId: number,
): AdminVolunteerEventParticipations {
  return {
    event: clone(findEvent(eventId)),
    participations: clone(state.adminParticipations[eventId] ?? []),
  }
}

function saveAttendance(
  eventId: number,
  body: unknown,
): SaveVolunteerAttendanceResponse {
  const request = assertObject<SaveVolunteerAttendanceRequest>(body)
  const attendedIds = new Set(request.attendedParticipationIds ?? [])
  const absentIds = new Set(request.absentParticipationIds ?? [])
  const overlap = [...attendedIds].some((id) => absentIds.has(id))
  if (overlap) {
    throwMockError(
      'INVALID_REQUEST',
      '출석과 불참 대상이 중복되었습니다.',
      400,
    )
  }
  const participations = state.adminParticipations[eventId] ?? []
  const knownIds = new Set(participations.map(({ participationId }) => participationId))
  const unknownId = [...attendedIds, ...absentIds].find((id) => !knownIds.has(id))
  if (unknownId !== undefined) {
    throwMockError(
      'INVALID_REQUEST',
      `참여 정보 ${unknownId}를 찾을 수 없습니다.`,
      400,
    )
  }
  for (const participation of participations) {
    if (attendedIds.has(participation.participationId)) {
      participation.participationStatus = 'ATTENDED'
      participation.attendanceCheckedAt = MOCK_NOW
    } else if (absentIds.has(participation.participationId)) {
      participation.participationStatus = 'ABSENT'
      participation.attendanceCheckedAt = MOCK_NOW
    }
  }
  return {
    eventId,
    attendedCount: attendedIds.size,
    absentCount: absentIds.size,
    processedAt: MOCK_NOW,
  }
}

function parseId(match: RegExpMatchArray): number {
  return Number(match[1])
}

export async function handleVolunteerMockRequest<TResult>(
  request: MockApiRequest,
): Promise<TResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
  const { body, method, path, query } = request

  if (method === 'GET' && path === '/api/v1/volunteer/introduction') {
    return getIntroduction() as TResult
  }
  if (method === 'POST' && path === '/api/v1/volunteer-applications') {
    return (await createApplication(body)) as TResult
  }
  if (
    method === 'GET' &&
    path === '/api/v1/volunteer-applications/me/latest'
  ) {
    const application = getCurrentApplication()
    if (!application) {
      throwMockError('NOT_FOUND', '가입 신청 내역이 없습니다.', 404)
    }
    return toUserApplication(application) as TResult
  }

  let match = path.match(/^\/api\/v1\/volunteer-applications\/(\d+)$/)
  if (match && method === 'PATCH') {
    return (await updateApplication(parseId(match), body)) as TResult
  }
  if (match && method === 'DELETE') {
    return cancelApplication(parseId(match)) as TResult
  }

  if (method === 'GET' && path === '/api/v1/volunteer-events') {
    return getUserEventPage(query) as TResult
  }
  match = path.match(/^\/api\/v1\/volunteer-events\/(\d+)\/participants$/)
  if (match && method === 'GET') {
    const eventId = parseId(match)
    findEvent(eventId)
    return {
      participants: clone(state.maskedParticipants[eventId] ?? []),
    } as TResult
  }
  match = path.match(/^\/api\/v1\/volunteer-events\/(\d+)\/participations$/)
  if (match && method === 'POST') {
    return applyEvent(parseId(match)) as TResult
  }
  match = path.match(
    /^\/api\/v1\/volunteer-events\/(\d+)\/participations\/me$/,
  )
  if (match && method === 'DELETE') {
    return cancelEventParticipation(parseId(match)) as TResult
  }
  match = path.match(/^\/api\/v1\/volunteer-events\/(\d+)$/)
  if (match && method === 'GET') {
    const event = findEvent(parseId(match))
    if (event.visibility !== 'PUBLIC') {
      throwMockError('NOT_FOUND', '봉사 일정을 찾을 수 없습니다.', 404)
    }
    return toUserEvent(event) as TResult
  }

  if (
    method === 'GET' &&
    path === '/api/v1/volunteer-members/me/upcoming-events'
  ) {
    return clone(getUpcomingEvents()) as TResult
  }
  if (
    method === 'GET' &&
    path === '/api/v1/volunteer-members/me/completed-events'
  ) {
    return clone(state.completedEvents) as TResult
  }
  if (
    method === 'GET' &&
    path === '/api/v1/volunteer-members/me/summary'
  ) {
    return clone(state.summary) as TResult
  }

  if (
    method === 'GET' &&
    path === '/api/v1/admin/volunteer/applications'
  ) {
    return filterApplications(query) as TResult
  }
  match = path.match(
    /^\/api\/v1\/admin\/volunteer\/applications\/(\d+)\/photo$/,
  )
  if (match && method === 'GET') {
    findApplication(parseId(match))
    return new Blob(
      [
        '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400"><rect width="100%" height="100%" fill="#e2e8f0"/><circle cx="160" cy="135" r="62" fill="#94a3b8"/><path d="M55 360c18-92 74-130 105-130s87 38 105 130" fill="#94a3b8"/></svg>',
      ],
      { type: 'image/svg+xml' },
    ) as TResult
  }
  match = path.match(
    /^\/api\/v1\/admin\/volunteer\/applications\/(\d+)\/approve$/,
  )
  if (match && method === 'POST') {
    return approveApplication(parseId(match)) as TResult
  }
  match = path.match(
    /^\/api\/v1\/admin\/volunteer\/applications\/(\d+)\/reject$/,
  )
  if (match && method === 'POST') {
    return rejectApplication(
      parseId(match),
      assertObject<RejectVolunteerApplicationRequest>(body),
    ) as TResult
  }
  match = path.match(
    /^\/api\/v1\/admin\/volunteer\/applications\/(\d+)$/,
  )
  if (match && method === 'GET') {
    return clone(findApplication(parseId(match))) as TResult
  }

  if (method === 'GET' && path === '/api/v1/admin/volunteer/members') {
    return filterMembers(query) as TResult
  }
  match = path.match(
    /^\/api\/v1\/admin\/volunteer\/members\/(\d+)\/(suspend|activate|withdraw)$/,
  )
  if (match && method === 'POST') {
    const action = match[2]
    const nextStatus =
      action === 'suspend'
        ? 'SUSPENDED'
        : action === 'activate'
          ? 'ACTIVE'
          : 'WITHDRAWN'
    return changeMemberStatus(parseId(match), nextStatus, body) as TResult
  }
  match = path.match(/^\/api\/v1\/admin\/volunteer\/members\/(\d+)$/)
  if (match && method === 'GET') {
    return clone(findMember(parseId(match))) as TResult
  }

  if (path === '/api/v1/admin/volunteer/events') {
    if (method === 'GET') {
      return filterAdminEvents(query) as TResult
    }
    if (method === 'POST') {
      return (await createEvent(body)) as TResult
    }
  }
  if (
    method === 'POST' &&
    path === '/api/v1/admin/volunteer/event-images'
  ) {
    return (await uploadEventImage(body)) as TResult
  }
  match = path.match(
    /^\/api\/v1\/admin\/volunteer\/events\/(\d+)\/participations$/,
  )
  if (match && method === 'GET') {
    return getEventParticipations(parseId(match)) as TResult
  }
  match = path.match(
    /^\/api\/v1\/admin\/volunteer\/events\/(\d+)\/attendance$/,
  )
  if (match && method === 'POST') {
    return saveAttendance(parseId(match), body) as TResult
  }
  match = path.match(
    /^\/api\/v1\/admin\/volunteer\/events\/(\d+)\/(open|close|cancel)$/,
  )
  if (match && method === 'POST') {
    const eventId = parseId(match)
    if (match[2] === 'open') {
      return openEvent(eventId) as TResult
    }
    if (match[2] === 'close') {
      return closeEvent(eventId) as TResult
    }
    return cancelAdminEvent(
      eventId,
      assertObject<CancelVolunteerEventRequest>(body),
    ) as TResult
  }
  match = path.match(/^\/api\/v1\/admin\/volunteer\/events\/(\d+)$/)
  if (match && method === 'GET') {
    return clone(findEvent(parseId(match))) as TResult
  }
  if (match && method === 'PATCH') {
    return (await updateEvent(parseId(match), body)) as TResult
  }

  throwMockError(
    'MOCK_HANDLER_NOT_FOUND',
    `목업 응답이 정의되지 않았습니다: ${method} ${path}`,
    501,
  )
}

export function setVolunteerMockScenario(scenario: VolunteerMockScenario): void {
  activeScenario = scenario
  state = createState(scenario)
}

export function resetVolunteerMockData(): void {
  state = createState(activeScenario)
}

export function getVolunteerMockScenario(): VolunteerMockScenario {
  return activeScenario
}

export function getVolunteerMockSnapshot(): Readonly<VolunteerMockState> {
  return clone(state)
}
