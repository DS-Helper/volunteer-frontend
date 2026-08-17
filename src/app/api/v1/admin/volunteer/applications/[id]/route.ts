import { NextResponse } from 'next/server'

import { getPrisma } from '@/server/db/prisma'
import { requiredAdmin } from '@/server/auth/request'
import { mapAdminApplication } from '@/server/volunteer/admin-mappers'

export async function GET(request: Request, context: RouteContext<'/api/v1/admin/volunteer/applications/[id]'>) {
  await requiredAdmin(request)
  const { id } = await context.params
  const application = await getPrisma().volunteerApplication.findUnique({ where: { id } })
  if (!application) return NextResponse.json({ code: 'VOLUNTEER_APPLICATION_NOT_FOUND', message: '신청을 찾을 수 없습니다.' }, { status: 404 })
  return NextResponse.json({ data: mapAdminApplication(application) })
}
