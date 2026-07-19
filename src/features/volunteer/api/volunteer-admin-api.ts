import type {
  AdminVolunteerApplication,
  AdminVolunteerApplicationPage,
  AdminVolunteerApplicationQuery,
  AdminVolunteerEvent,
  AdminVolunteerEventImageUploadResponse,
  AdminVolunteerEventPage,
  AdminVolunteerEventParticipations,
  AdminVolunteerEventQuery,
  AdminVolunteerMemberDetail,
  AdminVolunteerMemberPage,
  AdminVolunteerMemberQuery,
  CancelVolunteerEventRequest,
  ChangeVolunteerMemberStatusRequest,
  CloseVolunteerEventRequest,
  CreateVolunteerEventRequest,
  RejectVolunteerApplicationRequest,
  SaveVolunteerAttendanceRequest,
  SaveVolunteerAttendanceResponse,
  UpdateVolunteerEventRequest,
} from '@/features/volunteer/types'
import type { PageResponse } from '@/lib/api'

import { volunteerApiRequest } from './volunteer-api-request'

const ADMIN_VOLUNTEER_PATH = '/api/v1/admin/volunteer'
const ADMIN_APPLICATIONS_PATH = `${ADMIN_VOLUNTEER_PATH}/applications`
const ADMIN_MEMBERS_PATH = `${ADMIN_VOLUNTEER_PATH}/members`
const ADMIN_EVENTS_PATH = `${ADMIN_VOLUNTEER_PATH}/events`

interface AdminBackendPage<T> {
  content: T[]
  page: { page: number; size: number; totalElements: number; totalPages: number }
}

function flattenAdminPage<T>(page: AdminBackendPage<T>): PageResponse<T> {
  return { content: page.content, ...page.page }
}

interface AdminBackendMemberDetail extends Omit<AdminVolunteerMemberDetail, 'id' | 'userId' | 'name' | 'gender' | 'phone' | 'joinedAt' | 'status' | 'capabilities'> {
  member: Pick<AdminVolunteerMemberDetail, 'id' | 'userId' | 'name' | 'gender' | 'phone' | 'joinedAt' | 'status' | 'capabilities'>
}

function flattenAdminMemberDetail(detail: AdminBackendMemberDetail): AdminVolunteerMemberDetail {
  return { ...detail.member, ...detail }
}

export function getAdminVolunteerApplications(
  query: AdminVolunteerApplicationQuery = {},
): Promise<AdminVolunteerApplicationPage> {
  return volunteerApiRequest<AdminBackendPage<AdminVolunteerApplication>>(ADMIN_APPLICATIONS_PATH, {
    cache: 'no-store',
    method: 'GET',
    query,
  }).then(flattenAdminPage)
}

export function getAdminVolunteerApplication(
  applicationId: string | number,
): Promise<AdminVolunteerApplication> {
  return volunteerApiRequest(`${ADMIN_APPLICATIONS_PATH}/${applicationId}`, {
    cache: 'no-store',
    method: 'GET',
  })
}

export function approveVolunteerApplication(
  applicationId: string | number,
): Promise<AdminVolunteerApplication> {
  return volunteerApiRequest(
    `${ADMIN_APPLICATIONS_PATH}/${applicationId}/approve`,
    { method: 'POST' },
  )
}

export function rejectVolunteerApplication(
  applicationId: string | number,
  request: RejectVolunteerApplicationRequest,
): Promise<AdminVolunteerApplication> {
  return volunteerApiRequest(
    `${ADMIN_APPLICATIONS_PATH}/${applicationId}/reject`,
    { body: request, method: 'POST' },
  )
}

export function getAdminVolunteerApplicationPhoto(
  applicationId: string | number,
): Promise<{ fileId: string; url: string; expiresAt: string }> {
  return volunteerApiRequest(
    `${ADMIN_APPLICATIONS_PATH}/${applicationId}/photo`,
    { cache: 'no-store', method: 'GET' },
  )
}

export function getAdminVolunteerMembers(
  query: AdminVolunteerMemberQuery = {},
): Promise<AdminVolunteerMemberPage> {
  return volunteerApiRequest<AdminBackendPage<AdminVolunteerMemberPage['content'][number]>>(ADMIN_MEMBERS_PATH, {
    cache: 'no-store',
    method: 'GET',
    query,
  }).then(flattenAdminPage)
}

export function getAdminVolunteerMember(
  memberId: string | number,
): Promise<AdminVolunteerMemberDetail> {
  return volunteerApiRequest<AdminBackendMemberDetail>(`${ADMIN_MEMBERS_PATH}/${memberId}`, {
    cache: 'no-store',
    method: 'GET',
  }).then(flattenAdminMemberDetail)
}

export function suspendVolunteerMember(
  memberId: string | number,
  request: ChangeVolunteerMemberStatusRequest,
): Promise<AdminVolunteerMemberDetail> {
  return volunteerApiRequest<AdminBackendMemberDetail>(`${ADMIN_MEMBERS_PATH}/${memberId}/suspend`, {
    body: request,
    method: 'POST',
  }).then(flattenAdminMemberDetail)
}

export function activateVolunteerMember(
  memberId: string | number,
  request: ChangeVolunteerMemberStatusRequest,
): Promise<AdminVolunteerMemberDetail> {
  return volunteerApiRequest<AdminBackendMemberDetail>(`${ADMIN_MEMBERS_PATH}/${memberId}/activate`, {
    body: request,
    method: 'POST',
  }).then(flattenAdminMemberDetail)
}

export function withdrawVolunteerMember(
  memberId: string | number,
  request: ChangeVolunteerMemberStatusRequest,
): Promise<AdminVolunteerMemberDetail> {
  return volunteerApiRequest<AdminBackendMemberDetail>(`${ADMIN_MEMBERS_PATH}/${memberId}/withdraw`, {
    body: request,
    method: 'POST',
  }).then(flattenAdminMemberDetail)
}

export function createAdminVolunteerEvent(
  request: CreateVolunteerEventRequest,
): Promise<AdminVolunteerEvent> {
  return volunteerApiRequest(ADMIN_EVENTS_PATH, { body: request, method: 'POST' })
}

export function uploadAdminVolunteerEventImage(
  image: File,
): Promise<AdminVolunteerEventImageUploadResponse> {
  const body = new FormData()
  body.append('image', image)
  return volunteerApiRequest(`${ADMIN_VOLUNTEER_PATH}/event-images`, {
    body,
    method: 'POST',
  })
}

export function getAdminVolunteerEvents(
  query: AdminVolunteerEventQuery = {},
): Promise<AdminVolunteerEventPage> {
  return volunteerApiRequest<AdminBackendPage<AdminVolunteerEvent>>(ADMIN_EVENTS_PATH, {
    cache: 'no-store',
    method: 'GET',
    query,
  }).then(flattenAdminPage)
}

export function getAdminVolunteerEvent(
  eventId: string | number,
): Promise<AdminVolunteerEvent> {
  return volunteerApiRequest(`${ADMIN_EVENTS_PATH}/${eventId}`, {
    cache: 'no-store',
    method: 'GET',
  })
}

export function updateAdminVolunteerEvent(
  eventId: string | number,
  request: UpdateVolunteerEventRequest,
): Promise<AdminVolunteerEvent> {
  return volunteerApiRequest(`${ADMIN_EVENTS_PATH}/${eventId}`, {
    body: request,
    method: 'PATCH',
  })
}

export function openAdminVolunteerEvent(
  eventId: string | number,
): Promise<AdminVolunteerEvent> {
  return volunteerApiRequest(`${ADMIN_EVENTS_PATH}/${eventId}/open`, {
    method: 'POST',
  })
}

export function closeAdminVolunteerEvent(
  eventId: string | number,
  request?: CloseVolunteerEventRequest,
): Promise<AdminVolunteerEvent> {
  return volunteerApiRequest(`${ADMIN_EVENTS_PATH}/${eventId}/close`, {
    body: request,
    method: 'POST',
  })
}

export function cancelAdminVolunteerEvent(
  eventId: string | number,
  request: CancelVolunteerEventRequest,
): Promise<AdminVolunteerEvent> {
  return volunteerApiRequest(`${ADMIN_EVENTS_PATH}/${eventId}/cancel`, {
    body: request,
    method: 'POST',
  })
}

export function getAdminVolunteerEventParticipations(
  eventId: string | number,
  signal?: AbortSignal,
): Promise<AdminVolunteerEventParticipations> {
  return volunteerApiRequest(
    `${ADMIN_EVENTS_PATH}/${eventId}/participations`,
    { cache: 'no-store', method: 'GET', signal },
  )
}

export function saveAdminVolunteerAttendance(
  eventId: string | number,
  request: SaveVolunteerAttendanceRequest,
): Promise<SaveVolunteerAttendanceResponse> {
  return volunteerApiRequest(`${ADMIN_EVENTS_PATH}/${eventId}/attendance`, {
    body: request,
    method: 'POST',
  })
}
