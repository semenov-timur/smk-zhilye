# Сайт ООО СМК «Жильё»

Сайт строительно-монтажной компании: витрина услуг и объектов, приём заявок,
админ-панель для менеджера.

**Стек:** Astro (сайт) · Payload 3 (бэкенд и админка) · PostgreSQL · TypeScript · Tailwind · Docker.

## Состояние

Есть каркас: сайт и админка запускаются одной командой, проверки идут в CI.
Страниц и контента пока нет — на главной техническая заглушка.

## Где что лежит

| Путь | Что это |
|---|---|
| `apps/site` | Сайт на Astro |
| `apps/cms` | Payload: коллекции, хуки, админка |
| `docs/product.md` | Что делаем и для кого, объём этапов |
| `docs/architecture.md` | Стек, схема, модель данных, окружения |
| `docs/design-system.md` | Цвета, шрифты, компоненты (после согласования макетов) |
| `docs/decisions/` | Записи архитектурных решений |
| `docs/specs/` | Как система работает сейчас |
| `docs/changes/` | Изменения в работе и архив выполненных |
| `docs/git-workflow.md` | Ветки, коммиты, PR, релизы |
| `CHANGELOG.md` | Журнал изменений по релизам |
| `CLAUDE.md` | Правила проекта для ИИ-агента |
| `.claude/skills/spec/` | Скилл для работы по спецификациям |

## Как ведётся разработка

Каждая заметная задача проходит цикл:
**спецификация → план → реализация → проверка → архив**.
Подробности — в `.claude/skills/spec/SKILL.md`.

Ветки: `main` — продакшен, `develop` — разработка (по умолчанию),
`change/NNN-slug` — по ветке на изменение, PR только в `develop`.
Релиз — PR `develop → main` и тег `vX.Y.Z`. Подробности — `docs/git-workflow.md`.

## Запуск

Нужны Docker Desktop (Compose v2). Для проверок с хоста — Node.js 26 LTS
(версия в `.nvmrc`) и pnpm 12.21.0: `npm i -g pnpm@12.21.0`.

```bash
cp .env.example .env
docker compose up        # или pnpm dev
```

Первый запуск ставит зависимости внутри Docker, это около двух минут.

| Что | Адрес |
|---|---|
| Сайт | http://localhost:4321 |
| Админка | http://localhost:3000/admin — при первом входе создайте пользователя |
| PostgreSQL | localhost:5432 |

Остановить — `docker compose down`, сбросить базу и зависимости — `docker compose down -v`.

## Проверки

Запускаются с хоста из корня репозитория:

```bash
pnpm install
docker compose up -d postgres   # база нужна для test и test:e2e

pnpm lint            # ESLint
pnpm format:check    # Prettier (pnpm format — исправить)
pnpm typecheck       # tsc (cms) и astro check (site)
pnpm test            # Vitest, apps/cms
pnpm build           # сборка обоих приложений

pnpm --filter site exec playwright install chromium   # один раз
pnpm test:e2e        # Playwright, apps/site; нужен pnpm build
```

`pnpm test:e2e` сам запускает CMS (на базе `<POSTGRES_DB>_e2e`) и сайт из сборок.
Если на портах 3000 и 4321 уже работает `docker compose up`, тесты используют его.

Те же проверки запускает CI (`.github/workflows/ci.yml`) на каждый pull request
в `develop` и `main`.

## Изменили коллекции Payload

```bash
pnpm --filter cms generate:types                  # обновить src/payload-types.ts
pnpm --filter cms payload migrate:create <имя>    # миграция для production
```

В dev Payload меняет схему базы сам, в production и e2e схема создаётся
только миграциями из `apps/cms/src/migrations/`.
