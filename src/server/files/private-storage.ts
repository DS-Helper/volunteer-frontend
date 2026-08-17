import 'server-only'

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

export async function storePrivateImage(file: File): Promise<{ fileId: string; objectKey: string; contentType: string; byteSize: number }> {
  if (process.env.FILE_STORAGE_MODE !== 'local') throw new Error('FILE_STORAGE_NOT_CONFIGURED')
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('FILE_TYPE_NOT_ALLOWED')
  if (file.size > 5 * 1024 * 1024) throw new Error('FILE_TOO_LARGE')
  const fileId = randomUUID()
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const objectKey = `private/${fileId}.${extension}`
  const directory = path.join(process.cwd(), '.data', 'uploads')
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, `${fileId}.${extension}`), Buffer.from(await file.arrayBuffer()))
  return { fileId, objectKey, contentType: file.type, byteSize: file.size }
}
