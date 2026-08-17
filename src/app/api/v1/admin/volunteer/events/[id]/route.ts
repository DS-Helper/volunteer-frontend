import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrisma } from '@/server/db/prisma'
import { requiredAdmin } from '@/server/auth/request'

const eventPatch = z.object({ title: z.string().trim().min(1).max(120), type: z.string().trim().min(1).max(50), imageFileId: z.string().uuid(), startAt: z.coerce.date(), endAt: z.coerce.date(), recruitmentDeadlineAt: z.coerce.date(), location: z.string().trim().min(1).max(200), capacity: z.coerce.number().int().min(1), description: z.string().trim().min(10).max(3000), supplies: z.string().nullable(), precautions: z.string().nullable(), status: z.enum(['DRAFT', 'OPEN']), visibility: z.enum(['PUBLIC', 'PRIVATE']) })

export async function GET(request: Request, context: RouteContext<'/api/v1/admin/volunteer/events/[id]'>) {
  await requiredAdmin(request); const { id } = await context.params
  const event = await getPrisma().volunteerEvent.findUnique({ where: { id }, include: { imageFile: true, _count: { select: { participations: { where: { status: { not: 'CANCELED' } } } } } } })
  if (!event) return NextResponse.json({ code: 'VOLUNTEER_EVENT_NOT_FOUND', message: '일정을 찾을 수 없습니다.' }, { status: 404 })
  return NextResponse.json({ data: event })
}

export async function PATCH(request: Request, context: RouteContext<'/api/v1/admin/volunteer/events/[id]'>) {
  const admin = await requiredAdmin(request); const { id } = await context.params
  const parsed = eventPatch.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_REQUEST', message: '일정 입력값을 확인해 주세요.' }, { status: 400 })
  const current = await getPrisma().volunteerEvent.findUnique({ where: { id } })
  if (!current) return NextResponse.json({ code: 'VOLUNTEER_EVENT_NOT_FOUND', message: '일정을 찾을 수 없습니다.' }, { status: 404 })
  if (['COMPLETED', 'CANCELED'].includes(current.status)) return NextResponse.json({ code: 'VOLUNTEER_EVENT_INVALID_STATE', message: '수정할 수 없는 일정 상태입니다.' }, { status: 409 })
  const event = await getPrisma().volunteerEvent.update({ where: { id }, data: { ...parsed.data, supplies: parsed.data.supplies || null, precautions: parsed.data.precautions || null, updatedBy: admin.sub }, include: { imageFile: true, _count: { select: { participations: { where: { status: { not: 'CANCELED' } } } } } } })
  return NextResponse.json({ data: event })
}
