import { NextResponse } from 'next/server'

import { getPrisma } from '@/server/db/prisma'
import { requiredAccessToken } from '@/server/auth/request'

export async function DELETE(request: Request, context: RouteContext<'/api/v1/volunteer-events/[eventId]/participations/me'>) {
  const claims = await requiredAccessToken(request)
  const { eventId } = await context.params
  const member = await getPrisma().volunteerMember.findUnique({ where: { userId: claims.sub } })
  if (!member) return NextResponse.json({ code: 'VOLUNTEER_MEMBER_NOT_ACTIVE', message: '활성 봉사단원이 아닙니다.' }, { status: 403 })
  const updated = await getPrisma().volunteerParticipation.updateMany({ where: { eventId, memberId: member.id, status: 'APPLIED' }, data: { status: 'CANCELED', canceledAt: new Date() } })
  if (!updated.count) return NextResponse.json({ code: 'VOLUNTEER_PARTICIPATION_NOT_FOUND', message: '취소할 참여 신청이 없습니다.' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
