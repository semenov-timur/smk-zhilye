import { requireEnv } from './env'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Media } from './collections/Media'
import { Users } from './collections/Users'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const siteURL = requireEnv('SITE_URL')

export default buildConfig({
  serverURL: requireEnv('CMS_PUBLIC_URL'),
  // Сайт ходит в API с другого адреса — разрешаем его явно
  cors: [siteURL],
  csrf: [siteURL],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: requireEnv('PAYLOAD_SECRET'),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: requireEnv('DATABASE_URL'),
    },
  }),
  sharp,
})
