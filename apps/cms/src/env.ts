import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Единый .env лежит в корне монорепозитория. Подгружаем его, если он есть.
// Уже заданные переменные (Docker, CI) не перезаписываются.
const rootEnv = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.env')
if (fs.existsSync(rootEnv)) {
  process.loadEnvFile(rootEnv)
}

export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Не задана переменная окружения ${name} (см. .env.example)`)
  }
  return value
}
