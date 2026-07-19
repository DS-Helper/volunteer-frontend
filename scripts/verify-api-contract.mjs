import { readFile } from 'node:fs/promises'

const source = await readFile('src/features/volunteer/api/volunteer-admin-api.ts', 'utf8')
const requiredPaths = ['ADMIN_APPLICATIONS_PATH', 'ADMIN_MEMBERS_PATH', 'ADMIN_EVENTS_PATH', 'event-images']
const missing = requiredPaths.filter((path) => !source.includes(path))
if (missing.length) {
  console.error(`API contract paths missing: ${missing.join(', ')}`)
  process.exit(1)
}
if (process.env.OPENAPI_URL) {
  const response = await fetch(process.env.OPENAPI_URL)
  if (!response.ok) throw new Error(`OpenAPI fetch failed: ${response.status}`)
  const document = await response.json()
  const paths = Object.keys(document.paths ?? {})
  const requiredOpenApiPaths = ['/api/v1/admin/volunteer/applications', '/api/v1/admin/volunteer/members', '/api/v1/admin/volunteer/events']
  const missingOpenApi = requiredOpenApiPaths.filter((path) => !paths.includes(path))
  if (missingOpenApi.length) throw new Error(`OpenAPI paths missing: ${missingOpenApi.join(', ')}`)
  console.log(`OpenAPI document check passed (${paths.length} paths).`)
}
console.log(`API contract smoke check passed (${requiredPaths.length} required paths).`)
