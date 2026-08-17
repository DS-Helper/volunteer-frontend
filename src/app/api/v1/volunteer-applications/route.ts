import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getPrisma } from '@/server/db/prisma'
import { requiredAccessToken } from '@/server/auth/request'
import { storePrivateImage } from '@/server/files/private-storage'

const applicationSchema = z.object({ name: z.string().min(1).max(50), phone: z.string().min(10).max(20), birthDate: z.string(), gender: z.string().min(1).max(20), neighborhood: z.string().min(1).max(100), preferredActivities: z.array(z.string()).min(1).max(10), motivation: z.string().min(20).max(2000) })

async function parseApplication(value: FormDataEntryValue | null): Promise<Record<string, unknown> | null> {
  if (!(value instanceof Blob)) return null
  try { const parsed: unknown = JSON.parse(await value.text()); return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : null } catch { return null }
}

export async function POST(request: Request) {
  const claims = await requiredAccessToken(request)
  const form = await request.formData()
  const rawApplication = await parseApplication(form.get('application'))
  const parsedApplication = applicationSchema.safeParse(rawApplication)
  const photo = form.get('photo')
  if (!parsedApplication.success || !(photo instanceof File)) return NextResponse.json({ code: 'VOLUNTEER_APPLICATION_INVALID', message: '가입 신청 정보를 확인해 주세요.' }, { status: 400 })
  const application = parsedApplication.data
  try {
    const file = await storePrivateImage(photo)
    const result = await getPrisma().$transaction(async (tx) => {
      const existing = await tx.volunteerApplication.findFirst({ where: { userId: claims.sub, status: { in: ['PENDING', 'APPROVED'] } } })
      if (existing) throw new Error('VOLUNTEER_APPLICATION_ALREADY_EXISTS')
      return tx.volunteerApplication.create({ data: { userId: claims.sub, name: application.name, phone: application.phone, birthDate: new Date(`${application.birthDate}T00:00:00.000Z`), gender: application.gender, neighborhood: application.neighborhood, preferredActivities: application.preferredActivities, motivation: application.motivation, photoFileId: file.fileId } })
    })
    return NextResponse.json({ data: { applicationId: result.id, name: result.name, phone: result.phone, birthDate: result.birthDate, gender: result.gender, neighborhood: result.neighborhood, preferredActivities: result.preferredActivities, motivation: result.motivation, status: result.status, rejectionReason: result.rejectionReason, createdAt: result.createdAt, capabilities: { canEdit: true, canCancel: true, canReapply: false } } }, { status: 201 })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'VOLUNTEER_APPLICATION_FAILED'
    const status = code === 'VOLUNTEER_APPLICATION_ALREADY_EXISTS' ? 409 : code === 'FILE_STORAGE_NOT_CONFIGURED' ? 503 : 400
    return NextResponse.json({ code, message: status === 503 ? '파일 저장소가 설정되지 않았습니다.' : '가입 신청을 처리하지 못했습니다.' }, { status })
  }
}
