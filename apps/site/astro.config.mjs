// @ts-check
import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

// Сайт рендерится на сервере при каждом запросе (docs/decisions/0002-ssr.md)
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: { host: true, port: 4321 },
  vite: {
    plugins: [tailwindcss()],
  },
})
