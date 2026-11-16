# apps/cms — бэкенд и админка на Payload

Payload 3 с адаптером PostgreSQL. Payload 3 работает внутри Next.js:
админка (`/admin`) и REST API (`/api/*`) — маршруты в `src/app/(payload)/`.
Эти файлы сгенерированы Payload, их не правим.

| Путь | Что это |
|---|---|
| `src/payload.config.ts` | Конфигурация: коллекции, база, адреса |
| `src/collections/` | Коллекции: `users` (доступ к админке), `media` |
| `src/migrations/` | Миграции базы, применяются при старте в production |
| `src/payload-types.ts` | Типы, генерируются `pnpm generate:types` |
| `src/env.ts` | Загрузка корневого `.env`, проверка обязательных переменных |
| `tests/` | Интеграционные тесты (Vitest) |

Команды — в корневом `README.md`. Переменные — в корневом `.env.example`.
