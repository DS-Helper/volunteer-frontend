import type {
  CreateVolunteerApplicationRequest,
  UpdateVolunteerApplicationRequest,
  VolunteerApplication,
  VolunteerIntroduction,
} from '@/features/volunteer/types'

import {
  createJsonMultipart,
  volunteerApiRequest,
} from './volunteer-api-request'
import { normalizeApplication, type BackendApplication } from './volunteer-user-contract'

const APPLICATIONS_PATH = '/api/v1/volunteer-applications'

export function getVolunteerIntroduction(): Promise<VolunteerIntroduction> {
  return volunteerApiRequest('/api/v1/volunteer/introduction', {
    cache: 'force-cache',
    method: 'GET',
    next: { revalidate: 300, tags: ['volunteer-introduction'] },
  })
}

export function createVolunteerApplication(
  request: CreateVolunteerApplicationRequest,
): Promise<VolunteerApplication> {
  const body = createJsonMultipart('application', request.application, {
    fieldName: 'photo',
    value: request.photo,
  })
  return volunteerApiRequest<BackendApplication>(APPLICATIONS_PATH, {
    body,
    method: 'POST',
  }).then(normalizeApplication)
}

export function getMyLatestVolunteerApplication(): Promise<VolunteerApplication> {
  return volunteerApiRequest<BackendApplication>(`${APPLICATIONS_PATH}/me/latest`, {
    cache: 'no-store',
    method: 'GET',
  }).then(normalizeApplication)
}

export function updateVolunteerApplication(
  applicationId: string | number,
  request: UpdateVolunteerApplicationRequest,
): Promise<VolunteerApplication> {
  const body = createJsonMultipart(
    'application',
    request.application,
    request.photo ? { fieldName: 'photo', value: request.photo } : undefined,
  )
  return volunteerApiRequest<BackendApplication>(`${APPLICATIONS_PATH}/${applicationId}`, {
    body,
    method: 'PATCH',
  }).then(normalizeApplication)
}

export function cancelVolunteerApplication(applicationId: string | number): Promise<void> {
  return volunteerApiRequest(`${APPLICATIONS_PATH}/${applicationId}`, {
    method: 'DELETE',
  })
}
