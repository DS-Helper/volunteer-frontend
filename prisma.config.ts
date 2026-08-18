import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // `prisma generate` does not connect to a database; deployment/runtime commands
  // still require DATABASE_URL through the application DB boundary.
  datasource: { url: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/volunteer' },
})
