import { NextResponse } from 'next/server'

import { getPrisma } from '@/server/db/prisma'
import { requiredAdmin } from '@/server/auth/request'
import { mapAdminApplication } from '@/server/volunteer/admin-mappers'

export async function GET(request: Request) {
  await requiredAdmin(request)
  const url = new URL(request.url)
  const page = Math.max(Number(url.searchParams.get('page') ?? 0) || 0, 0)
  const size = Math.min(Math.max(Number(url.searchParams.get('size') ?? 20) || 20, 1), 100)
  const keyword = url.searchParams.get('keyword') ?? undefined
  const status = url.searchParams.get('status') as 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED' | undefined
  const where = { ...(status ? { status } : {}), ...(keyword ? { OR: [{ name: { contains: keyword, mode: 'insensitive' as const } }, { phone: { contains: keyword } }] } : {}) }
  const prisma = getPrisma()
  const [applications, totalElements] = await prisma.$transaction([prisma.volunteerApplication.findMany({ where, orderBy: { createdAt: 'desc' }, skip: page * size, take: size }), prisma.volunteerApplication.count({ where })])
  return NextResponse.json({ data: { content: applications.map(mapAdminApplication), page: { page, size, totalElements, totalPages: Math.ceil(totalElements / size), hasNext: (page + 1) * size < totalElements } } })
}
