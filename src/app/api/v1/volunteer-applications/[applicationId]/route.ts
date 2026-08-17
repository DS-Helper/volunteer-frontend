import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getPrisma } from '@/server/db/prisma'
import { requiredAccessToken } from '@/server/auth/request'
import { storePrivateImage } from '@/server/files/private-storage'

const applicationSchema = z.object({ name: z.string().min(1).max(50), phone: z.string().min(10).max(20), birthDate: z.string(), gender: z.string().min(1).max(20), neighborhood: z.string().min(1).max(100), preferredActivities: z.array(z.string()).min(1).max(10), motivation: z.string().min(20).max(2000) })

export async function DELETE(request: Request, context: RouteContext<'/api/v1/volunteer-applications/[applicationId]'>) {
  const claims = await requiredAccessToken(request)
  const { applicationId } = await context.params
  const result = await getPrisma().volunteerApplication.updateMany({ where: { id: applicationId, userId: claims.sub, status: 'PENDING' }, data: { status: 'CANCELED' } })
  if (!result.count) return NextResponse.json({ code: 'VOLUNTEER_APPLICATION_NOT_CANCELLABLE', message: '취소할 수 없는 신청입니다.' }, { status: 409 })
  return new NextResponse(null, { status: 204 })
}

export async function PATCH(request: Request, context: RouteContext<'/api/v1/volunteer-applications/[applicationId]'>) {
  const claims = await requiredAccessToken(request)
  const { applicationId } = await context.params
  const form = await request.formData()
  const applicationPart = form.get('application')
  const photo = form.get('photo')
  if (!(applicationPart instanceof Blob)) return NextResponse.json({ code: 'VOLUNTEER_APPLICATION_INVALID', message: '가입 신청 정보를 확인해 주세요.' }, { status: 400 })
  let raw: unknown
  try { raw = JSON.parse(await applicationPart.text()) } catch { raw = null }
  const parsed = applicationSchema.safeParse(raw)
  if (!parsed.success || (photo !== null && !(photo instanceof File))) return NextResponse.json({ code: 'VOLUNTEER_APPLICATION_INVALID', message: '가입 신청 정보를 확인해 주세요.' }, { status: 400 })
  try {
    const stored = photo instanceof File ? await storePrivateImage(photo) : null
    const result = await getPrisma().volunteerApplication.updateMany({ where: { id: applicationId, userId: claims.sub, status: 'PENDING' }, data: { name: parsed.data.name, phone: parsed.data.phone, birthDate: new Date(`${parsed.data.birthDate}T00:00:00.000Z`), gender: parsed.data.gender, neighborhood: parsed.data.neighborhood, preferredActivities: parsed.data.preferredActivities, motivation: parsed.data.motivation, ...(stored ? { photoFileId: stored.fileId } : {}) } })
    if (!result.count) return NextResponse.json({ code: 'VOLUNTEER_APPLICATION_NOT_EDITABLE', message: '수정할 수 없는 신청입니다.' }, { status: 409 })
    const updated = await getPrisma().volunteerApplication.findUniqueOrThrow({ where: { id: applicationId } })
    return NextResponse.json({ data: { applicationId: updated.id, name: updated.name, phone: updated.phone, birthDate: updated.birthDate, gender: updated.gender, neighborhood: updated.neighborhood, preferredActivities: updated.preferredActivities, motivation: updated.motivation, status: updated.status, rejectionReason: updated.rejectionReason, createdAt: updated.createdAt, capabilities: { canEdit: true, canCancel: true, canReapply: false } } })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'VOLUNTEER_APPLICATION_UPDATE_FAILED'
    return NextResponse.json({ code, message: '가입 신청을 수정하지 못했습니다.' }, { status: code === 'FILE_STORAGE_NOT_CONFIGURED' ? 503 : 400 })
  }
}
