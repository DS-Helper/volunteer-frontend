import { NextResponse } from 'next/server'

import { getPrisma } from '@/server/db/prisma'
import { requiredAccessToken } from '@/server/auth/request'

export async function GET(request: Request) {
  const claims = await requiredAccessToken(request)
  const member = await getPrisma().volunteerMember.findUnique({ where: { userId: claims.sub }, select: { id: true } })
  if (!member) return NextResponse.json({ code: 'VOLUNTEER_MEMBER_NOT_ACTIVE', message: '활성 봉사단원이 아닙니다.' }, { status: 403 })
  const rows = await getPrisma().volunteerParticipation.findMany({ where: { memberId: member.id, status: 'APPLIED', event: { startAt: { gt: new Date() } } }, orderBy: { event: { startAt: 'asc' } }, include: { event: { include: { imageFile: true } } } })
  return NextResponse.json({ data: { content: rows.map((row) => ({ eventId: row.event.id, title: row.event.title, imageUrl: row.event.imageFile.objectKey, startAt: row.event.startAt, endAt: row.event.endAt, location: row.event.location, participationStatus: row.status, recognizedMinutes: null, canCancel: true })), page: { page: 0, size: rows.length, totalElements: rows.length, totalPages: rows.length ? 1 : 0 } } })
}
