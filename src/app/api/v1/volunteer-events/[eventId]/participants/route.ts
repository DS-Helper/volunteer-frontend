import { NextResponse } from 'next/server'

import { getPrisma } from '@/server/db/prisma'
import { optionalAccessToken } from '@/server/auth/request'

export async function GET(request: Request, context: RouteContext<'/api/v1/volunteer-events/[eventId]/participants'>) {
  const { eventId } = await context.params
  const claims = await optionalAccessToken(request)
  if (!claims) return NextResponse.json({ code: 'AUTH_REQUIRED', message: '로그인이 필요합니다.' }, { status: 401 })
  const rows = await getPrisma().volunteerParticipation.findMany({ where: { eventId, status: { not: 'CANCELED' } }, include: { member: { select: { application: { select: { name: true } } } } } })
  const participants = rows.map((row) => ({ maskedName: row.member.application.name.length > 1 ? `${row.member.application.name.slice(0, 1)}*` : '*' }))
  return NextResponse.json({ data: { participants, participantCount: participants.length } })
}
