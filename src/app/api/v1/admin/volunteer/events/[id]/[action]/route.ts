import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrisma } from '@/server/db/prisma'
import { requiredAdmin } from '@/server/auth/request'

const actionParams = z.enum(['open', 'close', 'cancel'])
const reasonSchema = z.object({ reason: z.string().trim().max(500).optional() })

export async function POST(request: Request, context: RouteContext<'/api/v1/admin/volunteer/events/[id]/[action]'>) {
  const admin = await requiredAdmin(request)
  const { id, action: rawAction } = await context.params
  const action = actionParams.safeParse(rawAction)
  if (!action.success) return NextResponse.json({ code: 'INVALID_REQUEST', message: '지원하지 않는 일정 상태 변경입니다.' }, { status: 400 })
  const body = reasonSchema.safeParse(await request.json().catch(() => ({})))
  if (!body.success) return NextResponse.json({ code: 'INVALID_REQUEST', message: '사유를 확인해 주세요.' }, { status: 400 })
  const prisma = getPrisma()
  const current = await prisma.volunteerEvent.findUnique({ where: { id }, select: { id: true, status: true } })
  if (!current) return NextResponse.json({ code: 'VOLUNTEER_EVENT_NOT_FOUND', message: '일정을 찾을 수 없습니다.' }, { status: 404 })
  const transition = action.data === 'open' ? { from: ['DRAFT', 'CLOSED'], to: 'OPEN' as const } : action.data === 'close' ? { from: ['OPEN'], to: 'CLOSED' as const } : { from: ['OPEN', 'CLOSED'], to: 'CANCELED' as const }
  if (!transition.from.includes(current.status)) return NextResponse.json({ code: 'VOLUNTEER_EVENT_INVALID_STATE', message: '현재 상태에서 변경할 수 없습니다.' }, { status: 409 })
  const event = await prisma.volunteerEvent.update({ where: { id }, data: { status: transition.to, updatedBy: admin.sub, ...(action.data === 'close' ? { closeReason: body.data.reason ?? null } : {}), ...(action.data === 'cancel' ? { cancelReason: body.data.reason ?? null } : {}) } })
  return NextResponse.json({ data: { eventId: event.id, status: event.status, updatedAt: event.updatedAt } })
}
