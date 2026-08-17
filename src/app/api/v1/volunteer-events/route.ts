import { NextResponse } from 'next/server'

import { getPrisma } from '@/server/db/prisma'
import { optionalAccessToken } from '@/server/auth/request'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const page = Math.max(Number(url.searchParams.get('page') ?? 0) || 0, 0)
  const size = Math.min(Math.max(Number(url.searchParams.get('size') ?? 20) || 20, 1), 100)
  const status = url.searchParams.get('status') as 'DRAFT' | 'OPEN' | 'CLOSED' | 'COMPLETED' | 'CANCELED' | null
  const claims = await optionalAccessToken(request)
  const events = await getPrisma().volunteerEvent.findMany({
    where: { visibility: 'PUBLIC', ...(status ? { status } : {}) },
    orderBy: { startAt: 'asc' },
    skip: page * size,
    take: size,
    include: { imageFile: true, _count: { select: { participations: { where: { status: { not: 'CANCELED' } } } } } },
  })
  const totalElements = await getPrisma().volunteerEvent.count({ where: { visibility: 'PUBLIC', ...(status ? { status } : {}) } })
  const content = await Promise.all(events.map(async (event) => {
    const mine = claims ? await getPrisma().volunteerParticipation.findFirst({ where: { eventId: event.id, member: { userId: claims.sub } }, select: { status: true } }) : null
    return { eventId: event.id, title: event.title, type: event.type, imageUrl: event.imageFile.objectKey, startAt: event.startAt, endAt: event.endAt, location: event.location, capacity: event.capacity, participantCount: event._count.participations, status: event.status, myParticipationStatus: mine?.status ?? null, capabilities: { canApply: Boolean(claims) && event.status === 'OPEN', canCancel: mine?.status === 'APPLIED', canViewParticipants: Boolean(claims) } }
  }))
  return NextResponse.json({ data: { content, page: { page, size, totalElements, totalPages: Math.ceil(totalElements / size) } } })
}
