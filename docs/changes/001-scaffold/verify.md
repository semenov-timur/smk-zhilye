# Проверка: 001 — Каркас монорепозитория

Дата: 2026-11-16 · Ветка: `change/001-scaffold` · Коммит: `c639bb5`
· CI: [run 43766800513](https://github.com/semenov-timur/smk-zhilye/actions/runs/43766800513) · PR: [#1](https://github.com/semenov-timur/smk-zhilye/pull/1) (черновик)

## Автоматические проверки

Запущены из корня дважды: в рабочей копии и в свежем клоне ветки (после
`pnpm install`, с `docker compose up -d postgres`). Затем — в CI.

| Проверка | Результат |
|---|---|
| Линтер (`pnpm lint`) | ✅ |
| Форматирование (`pnpm format:check`) | ✅ |
| Типы (`pnpm typecheck`) | ✅ `tsc` без ошибок, `astro check` — 0 errors, 0 warnings |
| Тесты (`pnpm test`) | ✅ 1 прошёл |
| Сборка (`pnpm build`) | ✅ cms и site |
| e2e (`pnpm test:e2e`) | ✅ 4 прошли (2 теста × 360 и 1280 px) |
| CI на PR #1 | ✅ success за 1 мин 42 с, те же 1 + 4 теста |

## Критерии приёмки

| Критерий | Чем подтверждён | Статус |
|---|---|---|
| AC-1 | Свежий `git clone` ветки во временную папку → `cp .env.example .env` → `docker compose up -d` на пустых томах. Через 74 с: `postgres` healthy, `deps` завершился с кодом 0, `cms` и `site` запущены, сайт ответил 200. Ручных шагов не было. | ✅ |
| AC-2 | В том же стеке скрипт Playwright открыл `http://localhost:3000/admin` → редирект на `/admin/create-first-user` → создал пользователя → дашборд → `/admin/logout` → вход на `/admin/login` → дашборд, `/api/users/me` вернул этого пользователя. Скриншоты `screenshots/ac-2-create-first-user-1280.png`, `ac-2-admin-dashboard-1280.png` | ✅ |
| AC-3 | `apps/site/e2e/home.spec.ts` → «AC-3: home shows «CMS: доступна» when CMS is up» (360 и 1280 px, локально и в CI). В Docker-стеке: `screenshots/ac-3-home-cms-up-360.png`, `ac-3-home-cms-up-1280.png` | ✅ |
| AC-4 | `apps/site/e2e/home.spec.ts` → «AC-4: home returns 200 and shows «CMS: недоступна» when CMS is down» (360 и 1280 px, локально и в CI). Вручную: `docker compose stop cms` → главная ответила 200 за 0,43 с с текстом «CMS: недоступна», после `docker compose start cms` — снова «доступна». Скриншоты `screenshots/ac-4-home-cms-down-360.png`, `ac-4-home-cms-down-1280.png` | ✅ |
| AC-5 | `apps/cms/tests/users-access.test.ts` → «AC-5: anonymous GET /api/users returns 403». Тест ловит регрессию: при `access.read: () => true` у `users` он падает (`expected 200 to be 403`), проверено и откачено. | ✅ |
| AC-6 | В свежем клоне выполнены команды из раздела «Проверки» `README.md`: `pnpm install`, `lint`, `format:check`, `typecheck`, `test`, `build`, `test:e2e` — все с кодом 0 | ✅ |
| AC-7 | Черновой PR #1 `change/001-scaffold → develop`, событие `pull_request`, CI-run 43766800513 — success | ✅ |
| AC-8 | `git ls-files` содержит только `.env.example`. `git check-ignore` подтверждает, что `.env`, `apps/*/.env*` игнорируются. `git log --all -- .env` пуст. В `.env.example` только заглушки (`change-me…`, пустые значения); пароль и секрет в `ci.yml` — тестовые значения только для CI. | ✅ |

## Нужно проверить вам

- На своей машине: `cp .env.example .env && docker compose up` (или `pnpm dev`),
  открыть http://localhost:4321 и http://localhost:3000/admin, создать пользователя.
  Первый запуск ставит зависимости около полутора минут.
- Посмотреть скриншоты в `screenshots/`: заглушка свёрстана нейтрально,
  `docs/design-system.md` пока не заполнен.
- Включить защиту веток `main` и `develop` в GitHub (раздел в `docs/git-workflow.md`),
  в обязательные проверки добавить `check` из CI.

## Отклонения от плана

- **Отдельная база для e2e.** Dev и Vitest синхронизируют схему без миграций (push), а CMS
  в production-режиме на такой базе зависает на интерактивном вопросе. Поэтому e2e
  работает с базой `<POSTGRES_DB>_e2e`. Её создаёт `docker/postgres/init-e2e-db.sh`
  при первом запуске Postgres, в CI — шаг `psql`.
- **Polling для hot reload не понадобился:** Docker Desktop передаёт события файлов,
  hot reload сайта проверен.
- **Prettier не проверяет `*.md` во всём репозитории**, а не только в `docs/`: README и
  CLAUDE.md тоже не переформатируются автоматически.
- **`verbatimModuleSyntax` отключён в `apps/cms`:** Payload генерирует миграции с обычным
  импортом типов, и сборка Next на них падала.
- **Не указанные в плане вспомогательные пакеты:** `@payloadcms/ui` (есть в официальном
  шаблоне, нужен админке), `@types/node`, `@types/react`, `@types/react-dom` (типы для `tsc`).
- **Из шаблона Payload убраны** фронтенд-страница, пример `my-route` и маршруты GraphQL
  (сайт использует REST). Пакет `graphql` остался — это обязательная зависимость `@payloadcms/next`.
- **В `next.config.ts` выключен `agentRules`:** иначе Next 16 генерирует `apps/cms/AGENTS.md`.
- **pnpm 12 блокирует скрипты установки:** в `pnpm-workspace.yaml` разрешён только `esbuild`.
- **Корневой `.env` подгружается встроенным `process.loadEnvFile`** (CMS, Astro, Playwright)
  и флагом `--env-file-if-exists` (запуск сайта). Пакет `dotenv` не нужен. Уже заданные
  переменные (Docker, CI) не перезаписываются.
- **В проверке AC-1 dev-образ** (`node:26.13.1-bookworm-slim` + pnpm) был взят из кэша Docker,
  тома — пустые. Dockerfile ничего не копирует из репозитория, поэтому на результат это не влияет.
