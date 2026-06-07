import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Collections } from './collections/Collections'
import { Texts } from './collections/Texts'
import { Figures } from './collections/Figures'
import { Videos } from './collections/Videos'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const serverURL =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  'http://localhost:3000'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  collections: [Users, Media, Collections, Texts, Figures, Videos],

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET || '',

  serverURL,

  cors: [
    'http://localhost:3000',
    'http://localhost:4321',
    'https://cms.adechlien.blog',
    'https://adechlien.blog',
  ],

  csrf: [
    'http://localhost:3000',
    'http://localhost:4321',
    'https://cms.adechlien.blog',
    'https://adechlien.blog',
  ],

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    },
  }),

  sharp,

  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
