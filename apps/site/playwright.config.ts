import fs from 'node:fs'

import { defineConfig, devices } from '@playwright/test'

const rootEnv = new URL('../../.env', import.meta.url)
if (fs.existsSync(rootEnv)) {
  process.loadEnvFile(rootEnv)
}

const isCI = Boolean(process.env.CI)

// CMS в e2e работает в production-режиме и сама применяет миграции. Базу dev
// Payload синхронизирует без миграций (push), поэтому e2e берёт отдельную базу
// с суффиксом _e2e. Её создаёт docker/postgres/init-e2e-db.sh (в CI — шаг workflow).
function e2eDatabaseUrl(): string {
  const url = new URL(process.env.DATABASE_URL ?? 'postgres://smk:change-me@localhost:5432/smk')
  url.pathname = `${url.pathname}_e2e`
  return url.toString()
}

// Перед запуском нужны production-сборки (`pnpm build`) и запущенный Postgres.
export default defineConfig({
  testDir: './e2e',
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-360',
      use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 800 } },
    },
    {
      name: 'desktop-1280',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: [
    {
      // Настоящая CMS: сайт на :4321 проверяет связь с ней
      command: 'pnpm --filter cms start',
      url: 'http://localhost:3000/api/users/me',
      reuseExistingServer: !isCI,
      timeout: 120_000,
      env: { DATABASE_URL: e2eDatabaseUrl() },
    },
    {
      command: 'pnpm start',
      url: 'http://localhost:4321',
      reuseExistingServer: !isCI,
      env: { PORT: '4321', CMS_API_URL: 'http://localhost:3000' },
    },
    {
      // Сайт, у которого CMS «остановлена»: по этому адресу никто не слушает
      command: 'pnpm start',
      url: 'http://localhost:4322',
      reuseExistingServer: !isCI,
      env: { PORT: '4322', CMS_API_URL: 'http://127.0.0.1:9' },
    },
  ],
})
