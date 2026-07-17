import type {
  VolunteerEventDetail,
  VolunteerEventPage,
  VolunteerEventParticipants,
  VolunteerEventQuery,
} from '@/features/volunteer/types'

import { volunteerApiRequest } from './volunteer-api-request'
import {
  normalizeEventDetail,
  normalizeEventPage,
  type BackendEventDetail,
  type BackendEventPage,
} from './volunteer-user-contract'

const EVENTS_PATH = '/api/v1/volunteer-events'

export function getVolunteerEvents(
  query: VolunteerEventQuery = {},
): Promise<VolunteerEventPage> {
  return volunteerApiRequest<BackendEventPage>(EVENTS_PATH, {
    cache: 'no-store',
    method: 'GET',
    query,
  }).then(normalizeEventPage)
}

export function getVolunteerEvent(eventId: string | number): Promise<VolunteerEventDetail> {
  return volunteerApiRequest<BackendEventDetail>(`${EVENTS_PATH}/${eventId}`, {
    cache: 'no-store',
    method: 'GET',
  }).then(normalizeEventDetail)
}

export function getVolunteerEventParticipants(
  eventId: string | number,
): Promise<VolunteerEventParticipants> {
  return volunteerApiRequest(`${EVENTS_PATH}/${eventId}/participants`, {
    cache: 'no-store',
    method: 'GET',
  })
}
