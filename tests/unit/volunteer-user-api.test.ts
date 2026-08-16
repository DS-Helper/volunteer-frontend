import { describe, expect, it, vi } from 'vitest'

const { requestMock, multipartMock } = vi.hoisted(() => ({
  requestMock: vi.fn(),
  multipartMock: vi.fn(() => new FormData()),
}))

vi.mock('@/features/volunteer/api/volunteer-api-request', () => ({
  volunteerApiRequest: requestMock,
  createJsonMultipart: multipartMock,
}))

import {
  cancelVolunteerApplication,
  getMyLatestVolunteerApplication,
  getVolunteerIntroduction,
  updateVolunteerApplication,
} from '@/features/volunteer/api/volunteer-application-api'
import { getVolunteerEvent, getVolunteerEvents } from '@/features/volunteer/api/volunteer-event-api'
import { applyVolunteerEvent, cancelVolunteerEventParticipation } from '@/features/volunteer/api/volunteer-participation-api'

describe('사용자 봉사 API 경로·메서드 계약', () => {
  it('소개 조회는 캐시 정책과 함께 고정 경로를 사용한다', async () => {
    requestMock.mockResolvedValueOnce({ title: '소개' })
    await expect(getVolunteerIntroduction()).resolves.toEqual({ title: '소개' })
    expect(requestMock).toHaveBeenCalledWith('/api/v1/volunteer/introduction', expect.objectContaining({ method: 'GET', cache: 'force-cache' }))
  })

  it('일정 목록·상세 경로와 query를 전달한다', async () => {
    requestMock.mockResolvedValueOnce({ content: [], page: 0 }).mockResolvedValueOnce({ id: 'event-1' })
    await getVolunteerEvents({ status: 'OPEN', page: 1 })
    await getVolunteerEvent('event-1')
    expect(requestMock).toHaveBeenNthCalledWith(1, '/api/v1/volunteer-events', expect.objectContaining({ method: 'GET', query: { status: 'OPEN', page: 1 } }))
    expect(requestMock).toHaveBeenNthCalledWith(2, '/api/v1/volunteer-events/event-1', expect.objectContaining({ method: 'GET', cache: 'no-store' }))
  })

  it('참여 신청·취소는 POST/DELETE 경계를 지킨다', async () => {
    requestMock.mockResolvedValue({ id: 'participation-1' })
    await applyVolunteerEvent('event-1')
    await cancelVolunteerEventParticipation('event-1')
    expect(requestMock).toHaveBeenNthCalledWith(1, '/api/v1/volunteer-events/event-1/participations', { method: 'POST' })
    expect(requestMock).toHaveBeenNthCalledWith(2, '/api/v1/volunteer-events/event-1/participations/me', { method: 'DELETE' })
  })

  it('신청 최신 조회·수정·취소의 경로와 method를 지킨다', async () => {
    requestMock.mockResolvedValue({ id: 'application-1', status: 'PENDING' })
    await getMyLatestVolunteerApplication()
    await updateVolunteerApplication('application-1', {
      application: {
        name: '홍길동',
        phone: '010-1234-5678',
        birthDate: '1990-01-01',
        gender: 'MALE',
        neighborhood: '달성군',
        preferredActivities: ['환경정화'],
        motivation: '충분히 긴 지원 동기입니다.',
      },
    })
    await cancelVolunteerApplication('application-1')
    expect(requestMock).toHaveBeenNthCalledWith(1, '/api/v1/volunteer-applications/me/latest', expect.objectContaining({ method: 'GET', cache: 'no-store' }))
    expect(requestMock).toHaveBeenNthCalledWith(2, '/api/v1/volunteer-applications/application-1', expect.objectContaining({ method: 'PATCH', body: expect.any(FormData) }))
    expect(requestMock).toHaveBeenNthCalledWith(3, '/api/v1/volunteer-applications/application-1', { method: 'DELETE' })
  })
})
