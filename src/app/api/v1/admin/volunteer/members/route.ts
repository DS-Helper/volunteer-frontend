import { NextResponse } from 'next/server'

import { getPrisma } from '@/server/db/prisma'
import { requiredAdmin } from '@/server/auth/request'

export async function GET(request: Request) {
  await requiredAdmin(request)
  const url = new URL(request.url)
  const page = Math.max(Number(url.searchParams.get('page') ?? 0) || 0, 0)
  const size = Math.min(Math.max(Number(url.searchParams.get('size') ?? 20) || 20, 1), 100)
  const keyword = url.searchParams.get('keyword') ?? undefined
  const status = url.searchParams.get('status') as 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN' | undefined
  const prisma = getPrisma()
  const matchingApplications = keyword
    ? await prisma.volunteerApplication.findMany({ where: { name: { contains: keyword, mode: 'insensitive' }, }, select: { id: true } })
    : []
  const where = {
    ...(status ? { status } : {}),
    ...(keyword ? { OR: [{ applicationId: { in: matchingApplications.map((application) => application.id) } }, { userId: keyword }] } : {}),
  }
  const [members, totalElements] = await Promise.all([
    prisma.volunteerMember.findMany({ where, orderBy: { joinedAt: 'desc' }, skip: page * size, take: size, include: { application: true, participations: { where: { status: 'ATTENDED' }, include: { event: { select: { startAt: true, endAt: true } } } } } }),
    prisma.volunteerMember.count({ where }),
  ])
  return NextResponse.json({ data: { content: members.map((member) => ({ id: member.id, userId: member.userId, name: member.application.name, gender: member.application.gender, phone: member.application.phone, status: member.status, joinedAt: member.joinedAt, totalParticipationCount: member.participations.length, totalHours: member.participations.reduce((sum, p) => sum + (p.event.endAt.getTime() - p.event.startAt.getTime()) / 3600000, 0), capabilities: { canActivate: member.status === 'SUSPENDED', canSuspend: member.status === 'ACTIVE', canWithdraw: member.status !== 'WITHDRAWN' } })), page: { page, size, totalElements, totalPages: Math.ceil(totalElements / size), hasNext: (page + 1) * size < totalElements } } })
}
