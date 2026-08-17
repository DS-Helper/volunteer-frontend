import { NextResponse } from 'next/server'

import { getPrisma } from '@/server/db/prisma'
import { optionalAccessToken } from '@/server/auth/request'

export async function GET(request: Request, context: RouteContext<'/api/v1/volunteer-events/[eventId]'>) {
  const { eventId } = await context.params
  const event = await getPrisma().volunteerEvent.findUnique({ where: { id: eventId }, include: { imageFile: true, _count: { select: { participations: { where: { status: { not: 'CANCELED' } } } } } } })
  if (!event || event.visibility !== 'PUBLIC') return NextResponse.json({ code: 'VOLUNTEER_EVENT_NOT_FOUND', message: '일정을 찾을 수 없습니다.' }, { status: 404 })
  const claims = await optionalAccessToken(request)
  const mine = claims ? await getPrisma().volunteerParticipation.findFirst({ where: { eventId, member: { userId: claims.sub } }, select: { status: true } }) : null
  return NextResponse.json({ data: {
    eventId: event.id, title: event.title, type: event.type, imageUrl: event.imageFile.objectKey,
    startAt: event.startAt, endAt: event.endAt, recruitmentDeadlineAt: event.recruitmentDeadlineAt,
    location: event.location, capacity: event.capacity, participantCount: event._count.participations,
    description: event.description, supplies: event.supplies ?? '', precautions: event.precautions ?? '',
    status: event.status, myParticipationStatus: mine?.status ?? null,
    capabilities: { canApply: Boolean(claims) && event.status === 'OPEN', canCancel: mine?.status === 'APPLIED', canViewParticipants: Boolean(claims) },
  } })
}
