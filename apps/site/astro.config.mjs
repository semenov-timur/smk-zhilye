// @ts-check
import fs from 'node:fs'

import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, envField } from 'astro/config'

// Единый .env лежит в корне монорепозитория. Уже заданные переменные
// (Docker, CI) не перезаписываются.
const rootEnv = new URL('../../.env', import.meta.url)
if (fs.existsSync(rootEnv)) {
  process.loadEnvFile(rootEnv)
}

// Сайт рендерится на сервере при каждом запросе (docs/decisions/0002-ssr.md)
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: { host: true, port: 4321 },
  env: {
    schema: {
      // Адрес CMS для запросов с сервера сайта. Читается при запуске, не при сборке.
      CMS_API_URL: envField.string({ context: 'server', access: 'secret', url: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
