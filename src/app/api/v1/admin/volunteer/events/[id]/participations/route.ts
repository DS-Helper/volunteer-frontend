import { NextResponse } from 'next/server'
import { getPrisma } from '@/server/db/prisma'
import { requiredAdmin } from '@/server/auth/request'

export async function GET(request: Request, context: RouteContext<'/api/v1/admin/volunteer/events/[id]/participations'>) {
  await requiredAdmin(request); const { id } = await context.params
  const prisma = getPrisma()
  const event = await prisma.volunteerEvent.findUnique({ where: { id }, include: { imageFile: true, _count: { select: { participations: { where: { status: { not: 'CANCELED' } } } } } } })
  if (!event) return NextResponse.json({ code: 'VOLUNTEER_EVENT_NOT_FOUND', message: '일정을 찾을 수 없습니다.' }, { status: 404 })
  const participations = await prisma.volunteerParticipation.findMany({ where: { eventId: id }, include: { member: { include: { application: true } } }, orderBy: { appliedAt: 'asc' } })
  return NextResponse.json({ data: { event, participations: participations.map((item) => ({ participationId: item.id, memberId: item.memberId, name: item.member.application.name, phone: item.member.application.phone, participationStatus: item.status, appliedAt: item.appliedAt, attendanceCheckedAt: item.attendanceCheckedAt })) } })
}
