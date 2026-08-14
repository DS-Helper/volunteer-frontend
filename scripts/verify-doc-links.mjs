import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const root = process.cwd()
const docsRoot = join(root, 'docs')
const routerPath = join(docsRoot, 'README.md')

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await markdownFiles(path))
    else if (entry.name.endsWith('.md')) files.push(path)
  }
  return files
}

const router = await readFile(routerPath, 'utf8')
const files = await markdownFiles(docsRoot)
const linked = new Set([...router.matchAll(/\]\(([^)#]+\.md)(?:#[^)]+)?\)/g)].map((match) => join(docsRoot, match[1].replaceAll('/', '\\'))))
const unlinked = files.filter((file) => file !== routerPath && !linked.has(file))

if (unlinked.length) {
  console.error(`Unlinked documentation: ${unlinked.map((file) => relative(root, file)).join(', ')}`)
  process.exit(1)
}

console.log(`Documentation structure check passed (${files.length} markdown files).`)
