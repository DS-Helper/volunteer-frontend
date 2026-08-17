import { readFile } from 'node:fs/promises'

const envExample = await readFile('.env.example', 'utf8')
const required = ['NEXT_PUBLIC_SITE_URL', 'DATABASE_URL', 'AUTH_JWT_SECRET', 'FILE_STORAGE_MODE']
const missing = required.filter((name) => !new RegExp(`^${name}=`, 'm').test(envExample))
if (missing.length) {
  console.error(`Missing deployment variables in .env.example: ${missing.join(', ')}`)
  process.exit(1)
}
if (/https:\/\/(?:be-test|admin-backend|server)\.dshelper\.kr/.test(envExample)) {
  console.error('External backend URL found in .env.example')
  process.exit(1)
}
console.log('Deployment configuration contract passed.')
