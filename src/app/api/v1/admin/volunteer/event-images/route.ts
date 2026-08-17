import { NextResponse } from 'next/server'
import { getPrisma } from '@/server/db/prisma'
import { requiredAdmin } from '@/server/auth/request'
import { storePrivateImage } from '@/server/files/private-storage'

export async function POST(request: Request) {
  await requiredAdmin(request)
  const form = await request.formData()
  const image = form.get('image')
  if (!(image instanceof File)) return NextResponse.json({ code: 'INVALID_REQUEST', message: '이미지 파일을 선택해 주세요.' }, { status: 400 })
  try {
    const stored = await storePrivateImage(image)
    const file = await getPrisma().volunteerFile.create({ data: { id: stored.fileId, objectKey: stored.objectKey, contentType: stored.contentType, byteSize: stored.byteSize } })
    return NextResponse.json({ data: { volunteerFileId: file.id, imageFileId: file.id, s3Key: file.objectKey, url: file.objectKey, contentType: file.contentType, width: 0, height: 0 } }, { status: 201 })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'FILE_UPLOAD_FAILED'
    const status = code === 'FILE_TOO_LARGE' || code === 'FILE_TYPE_NOT_ALLOWED' ? 400 : 503
    return NextResponse.json({ code, message: '이미지 업로드를 처리하지 못했습니다.' }, { status })
  }
}
