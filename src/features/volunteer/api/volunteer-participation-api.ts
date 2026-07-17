import type { VolunteerParticipation } from '@/features/volunteer/types'

import { volunteerApiRequest } from './volunteer-api-request'
import { normalizeParticipation, type BackendParticipation } from './volunteer-user-contract'

const EVENTS_PATH = '/api/v1/volunteer-events'

export function applyVolunteerEvent(
  eventId: string | number,
): Promise<VolunteerParticipation> {
  return volunteerApiRequest<BackendParticipation>(`${EVENTS_PATH}/${eventId}/participations`, {
    method: 'POST',
  }).then(normalizeParticipation)
}

export function cancelVolunteerEventParticipation(eventId: string | number): Promise<void> {
  return volunteerApiRequest(`${EVENTS_PATH}/${eventId}/participations/me`, {
    method: 'DELETE',
  })
}
