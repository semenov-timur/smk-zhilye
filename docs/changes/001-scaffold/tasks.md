# План: 001 — Каркас монорепозитория

Статус плана: утверждён 2026-11-16

## Подход

Корень — pnpm workspaces с общим конфигом TypeScript, ESLint и Prettier.
`apps/cms` создаём из официального шаблона Payload `blank` (create-payload-app 3.93.0)
и урезаем до `users` и `media`. Payload 3 устроен как приложение Next.js: админка
и REST API — это маршруты Next. Так работает сам Payload, отдельного решения
здесь нет. `apps/site` — Astro 7 в режиме SSR с Node-адаптером и Tailwind 4.
Локально всё поднимает Docker Compose. В CI CMS собирается и запускается
по-настоящему, чтобы e2e проверял реальную связь сайта с CMS.

Первым коммитом в ветке `change/001-scaffold` идут `change.md` (с вашими правками)
и этот план: `docs(changes): спецификация и план 001-scaffold`.

## Шаги

- [ ] 1. Корень монорепозитория
  - Файлы: `package.json` (`packageManager: pnpm@12.21.0`, `engines.node: >=26.13`),
    `pnpm-workspace.yaml`, `.nvmrc` (`26`), `tsconfig.base.json` (strict,
    `noUncheckedIndexedAccess`), `pnpm-lock.yaml`
  - Результат: `pnpm install` в корне проходит, в корне есть скрипты
    `lint`, `format`, `format:check`, `typecheck`, `test`, `test:e2e`, `build`, `dev`
- [ ] 2. Линтер и форматтер
  - Файлы: `eslint.config.js` (flat config: typescript-eslint, eslint-plugin-astro,
    eslint-config-prettier), `.prettierrc.json`, `.prettierignore`
  - Prettier проверяет код, JSON и YAML. `docs/**/*.md` не трогаем, чтобы
    форматтер не переписывал документацию. Сгенерированные файлы Payload
    (`payload-types.ts`, `importMap.js`, `migrations/`) исключены.
  - Результат: `pnpm lint` и `pnpm format:check` зелёные
- [ ] 3. `apps/cms`: Payload из шаблона blank
  - Файлы: `apps/cms/package.json`, `src/payload.config.ts`, `src/collections/Users.ts`,
    `src/collections/Media.ts`, `src/app/(payload)/**` (маршруты админки и API из шаблона),
    `next.config.ts`, `tsconfig.json` (extends base)
  - `serverURL` берётся из `CMS_PUBLIC_URL`, `cors`/`csrf` — из `SITE_URL`,
    подключение к БД — из `DATABASE_URL`. Медиа хранятся на диске в `apps/cms/media/`
    (уже в `.gitignore`).
  - Скрипты: `dev`, `build`, `start`, `typecheck` (`tsc --noEmit`), `generate:types`
  - Результат: при запущенном Postgres команда `pnpm --filter cms dev` открывает `/admin` на `:3000`
- [ ] 4. Начальная миграция БД
  - Файлы: `apps/cms/src/migrations/*` (`payload migrate:create initial`),
    `prodMigrations` в `postgresAdapter`
  - В dev Payload сам синхронизирует схему (`push`). В production (`next start`,
    CI) миграции применяются при старте.
  - Результат: `pnpm --filter cms build && start` на пустой БД создаёт таблицы
- [ ] 5. Vitest в `apps/cms` и тест AC-5
  - Файлы: `apps/cms/vitest.config.ts`, `apps/cms/tests/users-access.test.ts`
  - Тест `AC-5: anonymous GET /api/users returns 403` строит настоящий `Request`
    и отдаёт его REST-обработчику Payload (`REST_GET` из `@payloadcms/next/routes`).
    Так проверяется именно HTTP-ответ, а не Local API. Тест берёт БД из `DATABASE_URL`.
  - Результат: `pnpm test` зелёный
- [ ] 6. `apps/site`: Astro SSR и Tailwind
  - Файлы: `apps/site/package.json`, `astro.config.mjs` (`output: 'server'`,
    `@astrojs/node` в режиме `standalone`), `src/styles/global.css`
    (Tailwind 4 через `@tailwindcss/vite`), `tsconfig.json` (extends `astro/tsconfigs/strict`)
  - Скрипты: `dev`, `build`, `start` (`node dist/server/entry.mjs`), `typecheck` (`astro check`)
  - Результат: `pnpm --filter site dev` открывает сайт на `:4321`
- [ ] 7. Главная-заглушка со статусом CMS
  - Файлы: `apps/site/src/lib/cms.ts`, `apps/site/src/pages/index.astro`
  - `getCmsStatus()` на сервере делает `GET ${CMS_API_URL}/api/users/me` с таймаутом 2 с.
    Ответ 2xx — «CMS: доступна». Сетевая ошибка, таймаут или не-2xx —
    «CMS: недоступна», страница всё равно отвечает 200.
  - Стили нейтральные (`docs/design-system.md` не заполнен).
  - Результат: главная показывает название компании и статус
- [ ] 8. Playwright и e2e для AC-3, AC-4
  - Файлы: `apps/site/playwright.config.ts`, `apps/site/e2e/home.spec.ts`
  - `webServer` поднимает три процесса из production-сборок: CMS на `:3000`,
    сайт на `:4321` с настоящей CMS и сайт на `:4322` с `CMS_API_URL=http://127.0.0.1:9`
    (адрес, где CMS нет, — это имитация остановленной CMS). Локально уже
    запущенные серверы переиспользуются.
  - Проекты Playwright: 360 px и 1280 px.
  - Тесты: `AC-3: home shows «CMS: доступна» when CMS is up`,
    `AC-4: home returns 200 and shows «CMS: недоступна» when CMS is down`
  - Результат: `pnpm build && pnpm test:e2e` зелёные
- [ ] 9. Docker Compose для локальной разработки
  - Файлы: `docker-compose.yml`, `docker/dev.Dockerfile` (Node 26 + pnpm), `.dockerignore`
  - Сервисы: `postgres` (`postgres:18-alpine`, healthcheck, порт 5432 открыт для тестов
    с хоста), `deps` (разово ставит зависимости в именованные тома), `cms`, `site`.
    `cms` ждёт здоровый `postgres` и завершённый `deps`. `site` ждёт `cms`.
  - Исходники монтируются с хоста, `node_modules` лежат в томах (нужны Linux-сборки
    `sharp`). Внутри Compose переопределяем `DATABASE_URL` (хост `postgres`)
    и `CMS_API_URL=http://cms:3000`. Для hot reload на macOS включаем polling.
  - Корневой скрипт `pnpm dev` = `docker compose up`
  - Результат: AC-1, AC-2
- [ ] 10. Переменные окружения и секреты
  - Файлы: `.env.example`
  - Добавить `CMS_API_URL` и комментарии к каждой переменной, убрать строку
    «список уточняется в 001». Проверить `.gitignore` и что в git нет `.env`.
  - Результат: AC-8
- [ ] 11. CI на GitHub Actions
  - Файлы: `.github/workflows/ci.yml`
  - Запуск на `pull_request` в `develop` и `main`. Сервис Postgres 18,
    Node из `.nvmrc`, pnpm из `packageManager`.
    Шаги: `install --frozen-lockfile` → `lint` → `format:check` → `typecheck` →
    `test` → `build` → установка Chromium → `test:e2e`.
  - Результат: workflow готов, проверяется в шаге 13
- [ ] 12. Документация команд
  - Файлы: `README.md` (раздел «Запуск»), `CLAUDE.md` (раздел «Команды»),
    `apps/cms/README.md`, `apps/site/README.md`
  - Результат: установка, запуск, тесты, сборка описаны. Отдельно сказано, что
    `pnpm test` и `pnpm test:e2e` требуют запущенного Postgres
    (`docker compose up -d postgres`)
- [ ] 13. Полный прогон и проверка
  - `pnpm lint`, `format:check`, `typecheck`, `test`, `build`, `test:e2e` из корня.
  - AC-1, AC-2: свежий `git clone` во временную папку → `cp .env.example .env` →
    `docker compose up` → открыть сайт и админку, создать пользователя, войти.
    AC-4 дополнительно вручную: `docker compose stop cms`, обновить главную.
  - AC-7: запушить `change/001-scaffold` и открыть **черновой PR** в `develop`,
    чтобы запустился CI (мерджит только пользователь).
  - Результат: `verify.md`

## Покрытие критериев

| Критерий | Чем подтверждаем | Где |
|---|---|---|
| AC-1 | ручной прогон из свежего клона, вывод `docker compose ps` | `verify.md` |
| AC-2 | ручная проверка: создать первого пользователя, выйти, войти; скриншот админки | `verify.md`, `screenshots/` |
| AC-3 | e2e, 360 и 1280 px + скриншоты | `apps/site/e2e/home.spec.ts`, `screenshots/` |
| AC-4 | e2e (CMS по недоступному адресу) + ручная остановка контейнера `cms` | `apps/site/e2e/home.spec.ts`, `verify.md` |
| AC-5 | интеграционный тест (Vitest) | `apps/cms/tests/users-access.test.ts` |
| AC-6 | ручной прогон команд из README, вывод в отчёт | `verify.md` |
| AC-7 | зелёный CI на черновом PR, ссылка на запуск | `verify.md` |
| AC-8 | `git ls-files` без `.env`, просмотр `.env.example` | `verify.md` |

## Новые зависимости, переменные окружения, миграции

Версии — актуальные на 16.11.2026.

**Среда:** Node.js 26 LTS (Lithium, LTS с октября 2026), pnpm 12.21.0.
В Node 25+ нет corepack, поэтому pnpm ставится через `npm i -g`
в Dockerfile и через `pnpm/action-setup` в CI.

**Корень (dev):**
- `typescript@6.0.3` — **не 7.x**: typescript-eslint поддерживает TypeScript только до 6.0.
- `eslint@10`, `typescript-eslint@8.72`, `eslint-plugin-astro@3.2`,
  `eslint-config-prettier@10` — линтер для TS и `.astro`.
- `prettier@3.10`, `prettier-plugin-astro@1.1` — форматирование, включая `.astro`.

**apps/cms:**
- `payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`
  `@3.93.0` — сам Payload, адаптер Postgres, редактор текста (нужен конфигу по умолчанию).
- `next@16.4`, `react@19.3`, `react-dom@19.3` — Payload 3 работает внутри Next.js.
- `graphql@16` — обязательная peer-зависимость `@payloadcms/next`.
- `sharp@0.35` — ресайз изображений в коллекции `media`.
- dev: `vitest@5.1`.

**apps/site:**
- `astro@7.4`, `@astrojs/node@11.1` — SSR.
- `tailwindcss@4.3`, `@tailwindcss/vite@4.3` — для Tailwind 4 это официальный способ
  подключения. Пакет `@astrojs/tailwind` устарел.
- dev: `@astrojs/check`, `@playwright/test@1.65`.

**Переменные окружения:**
- Новая `CMS_API_URL` — адрес, по которому сервер сайта обращается к CMS. Он отличается
  от `CMS_PUBLIC_URL`: в Docker это `http://cms:3000`, а в браузере — `http://localhost:3000`.
- Остальные переменные уже есть в `.env.example`. Переменные SMTP и Telegram остаются
  до изменения с формой заявки.

**Миграции:** начальная миграция Payload (`users`, `media`) в `apps/cms/src/migrations/`.
Правило на будущее: изменил коллекции — создай миграцию.

## Риски и открытые вопросы

**Решения по вопросам (ответы пользователя 2026-11-16):**

1. Линтер и форматтер — ESLint + Prettier.
2. Node.js 26 LTS.
3. Название компании на заглушке — служебная подпись технической заглушки,
   заменяется в изменении о модели контента.
4. `pnpm test` и `pnpm test:e2e` требуют запущенного Postgres
   (`docker compose up -d postgres`), это указано в README. testcontainers не добавляем.
5. На шаге 13 агент пушит `change/001-scaffold` и открывает черновой PR в `develop`
   для запуска CI. Мерджит пользователь.

**Риски:**

- Связка pnpm и Next/Payload бывает чувствительна к hoisting. Если сборка не найдёт
  пакеты, добавлю `public-hoist-pattern` в `pnpm-workspace.yaml` (мелкая правка, сообщу).
- Монтирование исходников в Docker на macOS: hot reload через polling может быть медленным.
  На критерии это не влияет.
- Схема в dev (`push`) может разойтись с миграциями, если забыть создать миграцию.
  Защита — e2e в CI запускает CMS в production-режиме с миграциями.
- Тесты и dev пока используют одну БД. Сейчас тест только читает, поэтому это не мешает.
  Отдельную тестовую БД заведём, когда появятся тесты с записью.
- Защита веток `main`/`develop` в GitHub (раздел в `git-workflow.md`) в 001 не входит,
  её настраиваете вы в интерфейсе GitHub.
