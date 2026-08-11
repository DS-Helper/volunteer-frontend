import { readFile } from 'node:fs/promises'

const sourceFiles = [
  'src/features/volunteer/api/volunteer-admin-api.ts',
  'src/features/volunteer/api/volunteer-application-api.ts',
  'src/features/volunteer/api/volunteer-event-api.ts',
  'src/features/volunteer/api/volunteer-member-api.ts',
  'src/features/volunteer/api/volunteer-participation-api.ts',
]
const source = (await Promise.all(sourceFiles.map((file) => readFile(file, 'utf8')))).join('\n')
const statusSource = await readFile('src/features/volunteer/types/status.ts', 'utf8')
const requiredPaths = [
  'ADMIN_APPLICATIONS_PATH',
  'ADMIN_MEMBERS_PATH',
  'ADMIN_EVENTS_PATH',
  'event-images',
  '/api/v1/volunteer-applications',
  '/api/v1/volunteer-events',
  '/api/v1/volunteer-members/me',
  '/api/v1/volunteer/introduction',
]
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
    ['/api/v1/volunteer-applications/me/latest', 'get'],
    ['/api/v1/volunteer-events/{eventId}/participations', 'post'],
    ['/api/v1/volunteer-events/{eventId}/participations/me', 'delete'],
    ['/api/v1/volunteer-events', 'get'],
    ['/api/v1/volunteer-events/{eventId}', 'get'],
    ['/api/v1/volunteer-members/me/summary', 'get'],
    ['/api/v1/volunteer-members/me/upcoming-events', 'get'],
    ['/api/v1/volunteer-members/me/completed-events', 'get'],
    ['/api/v1/admin/volunteer/applications', 'get'],
    ['/api/v1/admin/volunteer/members', 'get'],
    ['/api/v1/admin/volunteer/events', 'get'],
    ['/api/v1/admin/volunteer/event-images', 'post'],
    ['/api/v1/admin/volunteer/applications/{id}/approve', 'post'],
    ['/api/v1/admin/volunteer/applications/{id}/reject', 'post'],
    ['/api/v1/admin/volunteer/events/{id}/attendance', 'post'],
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
