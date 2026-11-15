import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Первый запуск Payload синхронизирует схему БД — даём время
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
})
