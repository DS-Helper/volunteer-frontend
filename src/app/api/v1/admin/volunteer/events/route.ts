import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getPrisma } from '@/server/db/prisma'
import { requiredAdmin } from '@/server/auth/request'

const eventInput = z.object({
  title: z.string().trim().min(1).max(120), type: z.string().trim().min(1).max(50), imageFileId: z.string().uuid(),
  startAt: z.coerce.date(), endAt: z.coerce.date(), recruitmentDeadlineAt: z.coerce.date(), location: z.string().trim().min(1).max(200),
  capacity: z.coerce.number().int().min(1), description: z.string().trim().min(10).max(3000), supplies: z.string().nullable(), precautions: z.string().nullable(),
  status: z.enum(['DRAFT', 'OPEN']), visibility: z.enum(['PUBLIC', 'PRIVATE']),
}).superRefine((value, context) => {
  if (value.endAt <= value.startAt) context.addIssue({ code: 'custom', path: ['endAt'], message: 'endAt must be after startAt' })
  if (value.recruitmentDeadlineAt > value.startAt) context.addIssue({ code: 'custom', path: ['recruitmentDeadlineAt'], message: 'deadline must not be after startAt' })
})

function mapEvent(event: { id: string; title: string; type: string; imageFileId: string; startAt: Date; endAt: Date; recruitmentDeadlineAt: Date; location: string; capacity: number; description: string; supplies: string | null; precautions: string | null; status: string; closeReason: string | null; visibility: string; cancelReason: string | null; createdBy: string; updatedBy: string; createdAt: Date; updatedAt: Date; imageFile: { objectKey: string }; _count: { participations: number } }) {
  return { ...event, typeLabel: event.type, imageUrl: event.imageFile.objectKey, supplies: event.supplies ? event.supplies.split(/\r?\n/).filter(Boolean) : [], precautions: event.precautions ? event.precautions.split(/\r?\n/).filter(Boolean) : [], participantCount: event._count.participations, capabilities: { canEdit: !['COMPLETED', 'CANCELED'].includes(event.status), canOpen: event.status === 'DRAFT' || event.status === 'CLOSED', canClose: event.status === 'OPEN', canCancel: event.status === 'OPEN' || event.status === 'CLOSED', canManageAttendance: event.status === 'COMPLETED' } }
}

export async function POST(request: Request) {
  const admin = await requiredAdmin(request)
  const parsed = eventInput.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_REQUEST', message: '일정 입력값을 확인해 주세요.', fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 })
  const event = await getPrisma().volunteerEvent.create({ data: { ...parsed.data, supplies: parsed.data.supplies || null, precautions: parsed.data.precautions || null, createdBy: admin.sub, updatedBy: admin.sub }, include: { imageFile: true, _count: { select: { participations: { where: { status: { not: 'CANCELED' } } } } } } })
  return NextResponse.json({ data: mapEvent(event) }, { status: 201 })
}

export async function GET(request: Request) {
  await requiredAdmin(request)
  const url = new URL(request.url)
  const page = Math.max(Number(url.searchParams.get('page') ?? 0) || 0, 0)
  const size = Math.min(Math.max(Number(url.searchParams.get('size') ?? 20) || 20, 1), 100)
  const keyword = url.searchParams.get('keyword') ?? undefined
  const status = url.searchParams.get('status') as 'DRAFT' | 'OPEN' | 'CLOSED' | 'COMPLETED' | 'CANCELED' | undefined
  const where = { ...(keyword ? { OR: [{ title: { contains: keyword, mode: 'insensitive' as const } }, { location: { contains: keyword, mode: 'insensitive' as const } }] } : {}), ...(status ? { status } : {}) }
  const prisma = getPrisma()
  const [events, totalElements] = await prisma.$transaction([prisma.volunteerEvent.findMany({ where, orderBy: { startAt: 'desc' }, skip: page * size, take: size, include: { imageFile: true, _count: { select: { participations: { where: { status: { not: 'CANCELED' } } } } } } }), prisma.volunteerEvent.count({ where })])
  return NextResponse.json({ data: { content: events.map(mapEvent), page: { page, size, totalElements, totalPages: Math.ceil(totalElements / size), hasNext: (page + 1) * size < totalElements } } })
}
