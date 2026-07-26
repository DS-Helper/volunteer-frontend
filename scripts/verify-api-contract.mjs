import { readFile } from 'node:fs/promises'

const source = await readFile('src/features/volunteer/api/volunteer-admin-api.ts', 'utf8')
const statusSource = await readFile('src/features/volunteer/types/status.ts', 'utf8')
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
  const requiredOpenApiPaths = [
    ['/api/v1/volunteer/introduction', 'get'],
    ['/api/v1/volunteer-applications', 'get'],
    ['/api/v1/volunteer-events', 'get'],
    ['/api/v1/volunteer-members/me/summary', 'get'],
    ['/api/v1/admin/volunteer/applications', 'get'],
    ['/api/v1/admin/volunteer/members', 'get'],
    ['/api/v1/admin/volunteer/events', 'get'],
    ['/api/v1/admin/volunteer/event-images', 'post'],
  ]
  const missingOpenApi = requiredOpenApiPaths.filter(([path, method]) => !document.paths?.[path]?.[method])
  if (missingOpenApi.length) throw new Error(`OpenAPI paths missing: ${missingOpenApi.join(', ')}`)
  const enumNames = ['VOLUNTEER_APPLICATION_STATUSES', 'VOLUNTEER_MEMBER_STATUSES', 'VOLUNTEER_EVENT_STATUSES', 'VOLUNTEER_EVENT_VISIBILITIES', 'VOLUNTEER_PARTICIPATION_STATUSES']
  for (const name of enumNames) {
    const match = statusSource.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`))
    if (!match) throw new Error(`Frontend enum missing: ${name}`)
  }
  console.log(`OpenAPI document check passed (${paths.length} paths).`)
}
console.log(`API contract smoke check passed (${requiredPaths.length} required paths).`)
