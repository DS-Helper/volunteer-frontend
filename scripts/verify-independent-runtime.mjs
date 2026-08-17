import { readFile } from 'node:fs/promises'

const files = ['netlify.toml', 'src/lib/api/api-client.ts', 'src/features/volunteer/api/volunteer-admin-api.ts']
const forbidden = ['be-test.dshelper.kr', 'admin-backend.dshelper.kr', 'server.dshelper.kr']

for (const file of files) {
  const content = await readFile(file, 'utf8')
  for (const value of forbidden) {
    if (content.includes(value)) {
      console.error(`External backend reference found: ${value} in ${file}`)
      process.exitCode = 1
    }
  }
}

if (!process.exitCode) console.log(`Independent runtime check passed (${files.length} files).`)
