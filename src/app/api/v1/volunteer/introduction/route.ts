import { NextResponse } from 'next/server'

import { getPrisma } from '@/server/db/prisma'
import { optionalAccessToken } from '@/server/auth/request'

export async function GET(request: Request) {
  const claims = await optionalAccessToken(request)
  let applicationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED' | null = null
  let canApply = true
  let canEdit = false
  let canCancel = false
  let canReapply = false
  if (claims) {
    const application = await getPrisma().volunteerApplication.findFirst({ where: { userId: claims.sub }, orderBy: { createdAt: 'desc' }, select: { status: true } })
    applicationStatus = application?.status ?? null
    canApply = !application || application.status === 'REJECTED' || application.status === 'CANCELED'
    canEdit = application?.status === 'PENDING'
    canCancel = application?.status === 'PENDING'
    canReapply = canApply
  }
  return NextResponse.json({ data: {
    title: 'DSHelper 봉사단',
    description: '지역 문제 해결을 위해 함께 행동하는 봉사 플랫폼입니다.',
    activities: ['환경정화', '이웃 돌봄', '교육 지원', '지역행사 보조'],
    regions: ['대구 전체'],
    eligibilityRequirements: ['신청 일정에 책임감 있게 참여할 수 있는 분'],
    loggedIn: Boolean(claims),
    applicationStatus,
    capabilities: { canApply, canEdit, canCancel, canReapply, requiresLogin: !claims },
  } })
}
