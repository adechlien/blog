import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

import dotenv from 'dotenv'
import { createClient } from '../../../node_modules/@payloadcms/db-sqlite/node_modules/@libsql/client/lib-esm/node.js'

const envArgument = process.argv.find((argument) => argument.startsWith('--env='))
const envFile = path.resolve(process.cwd(), envArgument?.slice('--env='.length) || '.env.turso')
dotenv.config({ path: envFile, override: true })
if (!process.env.DATABASE_URL) throw new Error(`DATABASE_URL no esta configurada en ${envFile}`)
const databaseUrl = process.env.DATABASE_URL

const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupRoot = path.resolve(process.cwd(), 'backups', `payload-${timestamp}`)
const tablesDirectory = path.join(backupRoot, 'tables')
const mediaDirectory = path.join(backupRoot, 'media')

function jsonValue(value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString()
  if (value instanceof ArrayBuffer || value instanceof Uint8Array) {
    return { $base64: Buffer.from(value).toString('base64') }
  }
  return value
}

async function writeJson(filePath: string, value: unknown) {
  await fs.writeFile(filePath, `${JSON.stringify(value, (_, item) => jsonValue(item), 2)}\n`, 'utf8')
}

async function fileMetadata(filePath: string, relativePath: string) {
  const contents = await fs.readFile(filePath)
  return {
    path: relativePath.replaceAll('\\', '/'),
    sha256: crypto.createHash('sha256').update(contents).digest('hex'),
    bytes: contents.byteLength,
  }
}

function safeMediaName(row: Record<string, unknown>) {
  const filename = path.basename(String(row.filename || 'file'))
  return `${String(row.id)}--${filename}`.replace(/[^a-zA-Z0-9._-]/g, '_')
}

async function main() {
  await fs.mkdir(tablesDirectory, { recursive: true })
  await fs.mkdir(mediaDirectory, { recursive: true })

  const client = createClient({ url: databaseUrl, authToken: process.env.TURSO_AUTH_TOKEN })
  const tableResult = await client.execute(
    "SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  )
  const schema = tableResult.rows.map((row) => ({ name: String(row.name), sql: String(row.sql || '') }))
  const files: Array<{ path: string; sha256: string; bytes: number }> = []
  const counts: Record<string, number> = {}
  let mediaRows: Array<Record<string, unknown>> = []

  await writeJson(path.join(backupRoot, 'schema.json'), schema)
  files.push(await fileMetadata(path.join(backupRoot, 'schema.json'), 'schema.json'))

  for (const table of schema) {
    const quotedName = `"${table.name.replaceAll('"', '""')}"`
    const result = await client.execute(`SELECT * FROM ${quotedName}`)
    const rows = result.rows.map((row) => Object.fromEntries(Object.entries(row)))
    const relativePath = path.join('tables', `${table.name}.json`)
    const outputPath = path.join(backupRoot, relativePath)
    await writeJson(outputPath, rows)
    files.push(await fileMetadata(outputPath, relativePath))
    counts[table.name] = rows.length
    if (table.name === 'media') mediaRows = rows
    console.log(`${table.name}: ${rows.length}`)
  }

  const mediaErrors: Array<{ id: unknown; url: unknown; error: string }> = []
  let downloaded = 0
  for (const row of mediaRows) {
    if (typeof row.url !== 'string' || !row.url) continue
    const relativePath = path.join('media', safeMediaName(row))
    const outputPath = path.join(backupRoot, relativePath)
    try {
      const mediaUrl = new URL(row.url, process.env.PAYLOAD_PUBLIC_SERVER_URL).toString()
      const response = await fetch(mediaUrl)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      await fs.writeFile(outputPath, Buffer.from(await response.arrayBuffer()))
      files.push(await fileMetadata(outputPath, relativePath))
      downloaded += 1
    } catch (error) {
      mediaErrors.push({ id: row.id, url: row.url, error: error instanceof Error ? error.message : String(error) })
    }
  }

  const manifest = {
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    source: databaseUrl.startsWith('file:') ? 'sqlite' : 'libsql',
    tables: counts,
    media: {
      expected: mediaRows.filter((row) => typeof row.url === 'string' && row.url).length,
      downloaded,
      errors: mediaErrors,
    },
    files,
  }
  await writeJson(path.join(backupRoot, 'manifest.json'), manifest)
  client.close()
  console.log(`Respaldo creado en ${backupRoot}`)
  if (mediaErrors.length) throw new Error(`No se pudieron descargar ${mediaErrors.length} archivos de media`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
