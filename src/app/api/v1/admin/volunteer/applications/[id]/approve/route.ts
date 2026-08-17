import { NextResponse } from 'next/server'

import { getPrisma } from '@/server/db/prisma'
import { requiredAdmin } from '@/server/auth/request'
import { mapAdminApplication } from '@/server/volunteer/admin-mappers'

export async function POST(request: Request, context: RouteContext<'/api/v1/admin/volunteer/applications/[id]/approve'>) {
  const admin = await requiredAdmin(request)
  const { id } = await context.params
  try {
    const application = await getPrisma().$transaction(async (tx) => {
      const current = await tx.volunteerApplication.findUnique({ where: { id } })
      if (!current || current.status !== 'PENDING') throw new Error('VOLUNTEER_APPLICATION_INVALID_STATE')
      const updated = await tx.volunteerApplication.update({ where: { id }, data: { status: 'APPROVED', reviewedBy: admin.sub, reviewedAt: new Date() } })
      await tx.volunteerMember.upsert({ where: { applicationId: id }, create: { applicationId: id, userId: current.userId }, update: { status: 'ACTIVE' } })
      return updated
    })
    return NextResponse.json({ data: mapAdminApplication(application) })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'VOLUNTEER_APPLICATION_APPROVE_FAILED'
    return NextResponse.json({ code, message: '신청을 승인하지 못했습니다.' }, { status: code === 'VOLUNTEER_APPLICATION_INVALID_STATE' ? 409 : 400 })
  }
}
