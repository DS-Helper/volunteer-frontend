import { NextResponse } from 'next/server'

import { getPrisma } from '@/server/db/prisma'
import { requiredAccessToken } from '@/server/auth/request'

export async function POST(request: Request, context: RouteContext<'/api/v1/volunteer-events/[eventId]/participations'>) {
  const claims = await requiredAccessToken(request)
  const { eventId } = await context.params
  try {
    const result = await getPrisma().$transaction(async (tx) => {
      const event = await tx.volunteerEvent.findUnique({ where: { id: eventId } })
      if (!event || event.visibility !== 'PUBLIC') throw new Error('VOLUNTEER_EVENT_NOT_FOUND')
      if (event.status !== 'OPEN' || event.recruitmentDeadlineAt <= new Date()) throw new Error('VOLUNTEER_EVENT_NOT_APPLICABLE')
      const member = await tx.volunteerMember.findUnique({ where: { userId: claims.sub } })
      if (!member || member.status !== 'ACTIVE') throw new Error('VOLUNTEER_MEMBER_NOT_ACTIVE')
      const count = await tx.volunteerParticipation.count({ where: { eventId, status: { not: 'CANCELED' } } })
      if (count >= event.capacity) throw new Error('VOLUNTEER_EVENT_CAPACITY_FULL')
      const participation = await tx.volunteerParticipation.create({ data: { eventId, memberId: member.id }, select: { id: true, eventId: true, status: true, appliedAt: true, canceledAt: true } })
      return participation
    })
    return NextResponse.json({ data: { participationId: result.id, eventId: result.eventId, status: result.status, appliedAt: result.appliedAt, canceledAt: result.canceledAt } }, { status: 201 })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'VOLUNTEER_PARTICIPATION_FAILED'
    const status = code === 'VOLUNTEER_MEMBER_NOT_ACTIVE' ? 403 : code === 'VOLUNTEER_EVENT_NOT_FOUND' ? 404 : 409
    return NextResponse.json({ code, message: '봉사 일정에 참여할 수 없습니다.' }, { status })
  }
}
