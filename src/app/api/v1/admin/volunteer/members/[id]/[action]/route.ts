import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getPrisma } from '@/server/db/prisma'
import { requiredAdmin } from '@/server/auth/request'

const reasonSchema = z.object({ reason: z.string().optional() })

export async function POST(request: Request, context: RouteContext<'/api/v1/admin/volunteer/members/[id]/[action]'>) {
  await requiredAdmin(request)
  const { id, action } = await context.params
  const parsed = reasonSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success || !['activate', 'suspend', 'withdraw'].includes(action)) return NextResponse.json({ code: 'VOLUNTEER_MEMBER_INVALID_ACTION', message: '잘못된 단원 상태 변경입니다.' }, { status: 400 })
  const nextStatus = action === 'activate' ? 'ACTIVE' : action === 'suspend' ? 'SUSPENDED' : 'WITHDRAWN'
  try {
    const updated = await getPrisma().volunteerMember.update({ where: { id }, data: { status: nextStatus } })
    return NextResponse.json({ data: { id: updated.id, status: updated.status } })
  } catch {
    return NextResponse.json({ code: 'VOLUNTEER_MEMBER_NOT_FOUND', message: '단원을 찾을 수 없습니다.' }, { status: 404 })
  }
}
