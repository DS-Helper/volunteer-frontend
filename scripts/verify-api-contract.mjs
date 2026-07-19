import { readFile } from 'node:fs/promises'

const source = await readFile('src/features/volunteer/api/volunteer-admin-api.ts', 'utf8')
const requiredPaths = ['ADMIN_APPLICATIONS_PATH', 'ADMIN_MEMBERS_PATH', 'ADMIN_EVENTS_PATH', 'event-images']
const missing = requiredPaths.filter((path) => !source.includes(path))
if (missing.length) {
  console.error(`API contract paths missing: ${missing.join(', ')}`)
  process.exit(1)
}
console.log(`API contract smoke check passed (${requiredPaths.length} required paths).`)
