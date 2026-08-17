import { NextResponse } from 'next/server'

import { getPrisma } from '@/server/db/prisma'
import { requiredAccessToken } from '@/server/auth/request'

export async function GET(request: Request) {
  const claims = await requiredAccessToken(request)
  const application = await getPrisma().volunteerApplication.findFirst({ where: { userId: claims.sub }, orderBy: { createdAt: 'desc' } })
  if (!application) return NextResponse.json({ code: 'VOLUNTEER_APPLICATION_NOT_FOUND', message: '가입 신청이 없습니다.' }, { status: 404 })
  return NextResponse.json({ data: {
    applicationId: application.id, name: application.name, phone: application.phone, birthDate: application.birthDate,
    gender: application.gender, neighborhood: application.neighborhood, preferredActivities: application.preferredActivities,
    motivation: application.motivation, status: application.status, rejectionReason: application.rejectionReason,
    createdAt: application.createdAt, capabilities: { canEdit: application.status === 'PENDING', canCancel: application.status === 'PENDING', canReapply: application.status === 'REJECTED' || application.status === 'CANCELED' },
  } })
}
