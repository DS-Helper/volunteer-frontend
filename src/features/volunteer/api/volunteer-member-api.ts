import type {
  MyCompletedVolunteerEvent,
  MyUpcomingVolunteerEvent,
  MyVolunteerSummary,
} from '@/features/volunteer/types'

import { volunteerApiRequest } from './volunteer-api-request'
import {
  normalizeCompletedPage,
  normalizeSummary,
  normalizeUpcomingPage,
  type BackendMemberPage,
} from './volunteer-user-contract'

const MY_MEMBER_PATH = '/api/v1/volunteer-members/me'

export function getMyUpcomingVolunteerEvents(): Promise<
  MyUpcomingVolunteerEvent[]
> {
  return volunteerApiRequest<BackendMemberPage>(`${MY_MEMBER_PATH}/upcoming-events`, {
    cache: 'no-store',
    method: 'GET',
  }).then(normalizeUpcomingPage)
}

export function getMyCompletedVolunteerEvents(): Promise<
  MyCompletedVolunteerEvent[]
> {
  return volunteerApiRequest<BackendMemberPage>(`${MY_MEMBER_PATH}/completed-events`, {
    cache: 'no-store',
    method: 'GET',
  }).then(normalizeCompletedPage)
}

export function getMyVolunteerSummary(): Promise<MyVolunteerSummary> {
  return volunteerApiRequest<{ participationCount: number; totalMinutes: number }>(`${MY_MEMBER_PATH}/summary`, {
    cache: 'no-store',
    method: 'GET',
  }).then(normalizeSummary)
}
