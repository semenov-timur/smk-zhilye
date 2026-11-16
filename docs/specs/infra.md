# Область: инфраструктура

Как устроены репозиторий, локальный запуск, проверки и CI **сейчас**.
Обновляется при архивации изменений.

## Назначение

Сайт и админка запускаются одной командой, связаны через REST API,
а проверки качества идут локально и в CI на каждый pull request.

## Поведение

- Монорепозиторий на pnpm workspaces (pnpm 12.21.0, Node.js 26 LTS из `.nvmrc`):
  `apps/cms` и `apps/site`. Версии зависимостей зафиксированы точно, без `^`.
- `apps/cms` — Payload 3 на Next.js с адаптером PostgreSQL. Админка — `/admin`,
  REST API — `/api/*`, порт 3000. GraphQL-маршрутов нет.
- `apps/site` — Astro в режиме SSR (Node-адаптер, `standalone`) и Tailwind CSS 4, порт 4321.
- Главная сайта — техническая заглушка: «ООО СМК «Жильё»» и статус связи с CMS.
  Сервер сайта запрашивает `GET ${CMS_API_URL}/api/users/me` с таймаутом 2 с.
  Ответ 2xx — «CMS: доступна». Сетевая ошибка, таймаут или не-2xx — «CMS: недоступна»,
  страница всё равно отвечает 200.
- `cp .env.example .env && docker compose up` (или `pnpm dev`) поднимает `postgres`
  (PostgreSQL 18), `deps` (разовая установка зависимостей в тома Docker), `cms` и `site`
  в dev-режиме с hot reload. Исходники монтируются с хоста, `node_modules` хранятся в томах.
- Единый `.env` лежит в корне. CMS, Astro и Playwright подгружают его сами
  и не перезаписывают уже заданные переменные (Docker, CI).
- Схема базы:
  - в dev (`next dev`) и в Vitest Payload синхронизирует схему сам (push);
  - в production (`next start`) применяются миграции из `apps/cms/src/migrations/` при старте.
- Проверки из корня: `pnpm lint` (ESLint), `pnpm format:check` (Prettier, без `*.md`),
  `pnpm typecheck` (`tsc` в cms, `astro check` в site), `pnpm test` (Vitest, cms),
  `pnpm build`, `pnpm test:e2e` (Playwright, site).
- `pnpm test` и `pnpm test:e2e` требуют запущенного Postgres (`docker compose up -d postgres`).
- `pnpm test:e2e` запускает из production-сборок:
  - CMS на :3000, на базе `<POSTGRES_DB>_e2e`;
  - сайт на :4321, связанный с CMS;
  - сайт на :4322 с недоступным `CMS_API_URL`.

  Проверки идут на ширине 360 и 1280 px. Уже запущенные серверы на этих портах
  переиспользуются (кроме CI).
- База `<POSTGRES_DB>_e2e` создаётся скриптом `docker/postgres/init-e2e-db.sh` при первом
  запуске Postgres с пустым томом, в CI — шагом workflow.
- CI (`.github/workflows/ci.yml`, job `check`) запускается на каждый pull request в `develop`
  и `main`. Шаги:
  1. `install --frozen-lockfile`;
  2. lint, format:check, typecheck;
  3. test, build;
  4. e2e с Postgres 18 в сервис-контейнере.

## Данные

- `users` — пользователи админки (auth по email и паролю), полей сверх стандартных нет.
- `media` — загрузки с обязательным полем `alt`. Файлы хранятся в `apps/cms/media/`
  (не в git).

## Переменные окружения

Полный список с комментариями — `.env.example`:

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL`;
- `PAYLOAD_SECRET`;
- `CMS_PUBLIC_URL` — `serverURL` Payload;
- `CMS_API_URL` — адрес CMS для сервера сайта, в Docker — `http://cms:3000`;
- `SITE_URL` — разрешён в CORS и CSRF Payload.

CMS не стартует без `DATABASE_URL`, `PAYLOAD_SECRET`, `CMS_PUBLIC_URL` и `SITE_URL`.

## Ограничения и правила

- Анонимный `GET /api/users` возвращает 403: доступ Payload по умолчанию, покрыт тестом.
- `media` читается публично.
- `.env` и `.env.*` (кроме `.env.example`) в `.gitignore`. В `.env.example` только заглушки.
- После изменения коллекций: `pnpm --filter cms generate:types` и
  `pnpm --filter cms payload migrate:create <имя>`.
- pnpm запускает скрипты установки только у пакетов из `allowBuilds`
  в `pnpm-workspace.yaml` (сейчас `esbuild`).

## История

- [001 — Каркас монорепозитория](../changes/archive/2026-11-17-001-scaffold/change.md)
