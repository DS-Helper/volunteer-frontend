import { NextResponse } from 'next/server'

import { getPrisma } from '@/server/db/prisma'
import { requiredAccessToken } from '@/server/auth/request'

export async function GET(request: Request) {
  const claims = await requiredAccessToken(request)
  const member = await getPrisma().volunteerMember.findUnique({ where: { userId: claims.sub }, select: { id: true } })
  if (!member) return NextResponse.json({ code: 'VOLUNTEER_MEMBER_NOT_ACTIVE', message: '활성 봉사단원이 아닙니다.' }, { status: 403 })
  const participations = await getPrisma().volunteerParticipation.findMany({ where: { memberId: member.id, status: 'ATTENDED' }, include: { event: { select: { startAt: true, endAt: true } } } })
  const totalMinutes = participations.reduce((sum, row) => sum + Math.max(0, Math.round((row.event.endAt.getTime() - row.event.startAt.getTime()) / 60000)), 0)
  return NextResponse.json({ data: { participationCount: participations.length, totalMinutes } })
}
