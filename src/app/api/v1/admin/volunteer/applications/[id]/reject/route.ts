import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getPrisma } from '@/server/db/prisma'
import { requiredAdmin } from '@/server/auth/request'
import { mapAdminApplication } from '@/server/volunteer/admin-mappers'

const schema = z.object({ rejectionReason: z.string().min(1), adminMemo: z.string().optional() })

export async function POST(request: Request, context: RouteContext<'/api/v1/admin/volunteer/applications/[id]/reject'>) {
  const admin = await requiredAdmin(request)
  const { id } = await context.params
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ code: 'VOLUNTEER_APPLICATION_INVALID', message: '반려 사유를 입력해 주세요.' }, { status: 400 })
  const current = await getPrisma().volunteerApplication.findUnique({ where: { id } })
  if (!current || current.status !== 'PENDING') return NextResponse.json({ code: 'VOLUNTEER_APPLICATION_INVALID_STATE', message: '반려할 수 없는 신청입니다.' }, { status: 409 })
  const updated = await getPrisma().volunteerApplication.update({ where: { id }, data: { status: 'REJECTED', rejectionReason: parsed.data.rejectionReason, adminMemo: parsed.data.adminMemo, reviewedBy: admin.sub, reviewedAt: new Date() } })
  return NextResponse.json({ data: mapAdminApplication(updated) })
}
