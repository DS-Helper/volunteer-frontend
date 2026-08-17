import { NextResponse } from 'next/server'

import { getPrisma } from '@/server/db/prisma'
import { requiredAdmin } from '@/server/auth/request'


export async function GET(request: Request, context: RouteContext<'/api/v1/admin/volunteer/members/[id]'>) {
  await requiredAdmin(request)
  const { id } = await context.params
  const member = await getPrisma().volunteerMember.findUnique({ where: { id }, include: { application: true, participations: { include: { event: true } } } })
  if (!member) return NextResponse.json({ code: 'VOLUNTEER_MEMBER_NOT_FOUND', message: '단원을 찾을 수 없습니다.' }, { status: 404 })
  const history = member.participations.map((p) => ({ participationId: p.id, eventId: p.eventId, title: p.event.title, startAt: p.event.startAt, endAt: p.event.endAt, location: p.event.location, status: p.status, recognizedHours: p.status === 'ATTENDED' ? (p.event.endAt.getTime() - p.event.startAt.getTime()) / 3600000 : null }))
  return NextResponse.json({ data: { member: { id: member.id, userId: member.userId, name: member.application.name, gender: member.application.gender, phone: member.application.phone, status: member.status, joinedAt: member.joinedAt, totalParticipationCount: member.participations.filter((p) => p.status === 'ATTENDED').length, totalHours: history.reduce((sum, p) => sum + (p.recognizedHours ?? 0), 0), capabilities: { canActivate: member.status === 'SUSPENDED', canSuspend: member.status === 'ACTIVE', canWithdraw: member.status !== 'WITHDRAWN' } }, application: { id: member.application.id, userId: member.application.userId, name: member.application.name, phone: member.application.phone, birthDate: member.application.birthDate, gender: member.application.gender, neighborhood: member.application.neighborhood, preferredActivities: member.application.preferredActivities, motivation: member.application.motivation, status: member.application.status, rejectionReason: member.application.rejectionReason, adminMemo: member.application.adminMemo, reviewedBy: member.application.reviewedBy, reviewedAt: member.application.reviewedAt, createdAt: member.application.createdAt, updatedAt: member.application.updatedAt, capabilities: { canApprove: false, canReject: false } }, totalParticipationCount: member.participations.filter((p) => p.status === 'ATTENDED').length, totalHours: history.reduce((sum, p) => sum + (p.recognizedHours ?? 0), 0), upcomingEvents: history.filter((p) => p.status === 'APPLIED'), attendanceHistory: history.filter((p) => p.status === 'ATTENDED'), absenceHistory: history.filter((p) => p.status === 'ABSENT'), cancellationHistory: history.filter((p) => p.status === 'CANCELED'), adminMemo: member.application.adminMemo, statusHistory: [] } })
}
