import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrisma } from '@/server/db/prisma'
import { requiredAdmin } from '@/server/auth/request'

const attendanceRequest = z.object({ attendedParticipationIds: z.array(z.string().uuid()), absentParticipationIds: z.array(z.string().uuid()) }).superRefine((value, context) => {
  const duplicates = value.attendedParticipationIds.filter((id) => value.absentParticipationIds.includes(id))
  if (duplicates.length) context.addIssue({ code: 'custom', path: ['absentParticipationIds'], message: '같은 참여자를 중복 처리할 수 없습니다.' })
})

export async function POST(request: Request, context: RouteContext<'/api/v1/admin/volunteer/events/[id]/attendance'>) {
  await requiredAdmin(request); const { id } = await context.params
  const parsed = attendanceRequest.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_REQUEST', message: '출석 입력값을 확인해 주세요.' }, { status: 400 })
  const ids = [...new Set([...parsed.data.attendedParticipationIds, ...parsed.data.absentParticipationIds])]
  if (!ids.length) return NextResponse.json({ code: 'INVALID_REQUEST', message: '처리할 참여자가 없습니다.' }, { status: 400 })
  const prisma = getPrisma(); const checkedAt = new Date()
  try {
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.volunteerEvent.findUnique({ where: { id }, select: { id: true, status: true } })
      if (!event) throw new Error('VOLUNTEER_EVENT_NOT_FOUND')
      if (event.status === 'CANCELED' || event.status === 'DRAFT') throw new Error('VOLUNTEER_EVENT_INVALID_STATE')
      const owned = await tx.volunteerParticipation.findMany({ where: { id: { in: ids }, eventId: id }, select: { id: true } })
      if (owned.length !== ids.length) throw new Error('VOLUNTEER_PARTICIPATION_EVENT_MISMATCH')
      const attended = await tx.volunteerParticipation.updateMany({ where: { id: { in: parsed.data.attendedParticipationIds }, eventId: id, status: { not: 'CANCELED' } }, data: { status: 'ATTENDED', attendanceCheckedAt: checkedAt } })
      const absent = await tx.volunteerParticipation.updateMany({ where: { id: { in: parsed.data.absentParticipationIds }, eventId: id, status: { not: 'CANCELED' } }, data: { status: 'ABSENT', attendanceCheckedAt: checkedAt } })
      return { attendedCount: attended.count, absentCount: absent.count }
    })
    return NextResponse.json({ data: { eventId: id, ...result, processedAt: checkedAt.toISOString() } })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'VOLUNTEER_ATTENDANCE_FAILED'
    const status = code === 'VOLUNTEER_EVENT_NOT_FOUND' ? 404 : code === 'VOLUNTEER_EVENT_INVALID_STATE' || code === 'VOLUNTEER_PARTICIPATION_EVENT_MISMATCH' ? 409 : 400
    return NextResponse.json({ code, message: '출석을 처리하지 못했습니다.' }, { status })
  }
}
