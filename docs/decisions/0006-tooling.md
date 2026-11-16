# 0006. Инструменты: Node 26, pnpm 12, TypeScript 6.0, ESLint + Prettier, единый .env

Дата: 2026-11-17 · Статус: принято

## Решение
- **Node.js 26 LTS** (Lithium). Версия в `.nvmrc`, в Docker — образ `node:26.x`.
- **pnpm 12.21** с workspaces: `apps/cms`, `apps/site`. Версия в `packageManager`.
  Зависимости ставятся с точными версиями (`saveExact`). Скрипты установки разрешены
  только пакетам из `allowBuilds`.
- **TypeScript 6.0.x**, не 7.x.
- **ESLint** (flat config, typescript-eslint, eslint-plugin-astro) и **Prettier**
  (с prettier-plugin-astro). Markdown Prettier не форматирует.
- **Единый `.env` в корне.** CMS, Astro и Playwright подгружают его встроенным
  `process.loadEnvFile`, запуск сайта — флагом `--env-file-if-exists`. Уже заданные
  переменные (Docker, CI) не перезаписываются. Пакет `dotenv` не нужен.

## Почему
- Node 26 — актуальная LTS на ноябрь 2026, её поддерживают Payload, Astro и Vitest.
- pnpm быстрый и строгий к необъявленным зависимостям. Точные версии и lockfile дают
  одинаковую сборку локально, в Docker и в CI.
- TypeScript 7 ещё не поддерживается typescript-eslint (нужен TypeScript < 6.1).
- ESLint + Prettier — стандарт с наибольшим числом примеров и плагином для `.astro`.
- Один `.env` проще, чем по файлу на приложение. Переменные описаны в одном месте —
  `.env.example`.

## Альтернативы
- Node 24 LTS — тоже поддерживается, но раньше выйдет из поддержки.
- npm workspaces — медленнее, слабее изоляция зависимостей.
- Biome вместо ESLint + Prettier — быстрее и один инструмент, но поддержка `.astro`
  и примеры беднее.
- Свой `.env` в каждом приложении — дублирование общих переменных.

## Когда пересмотреть
Когда typescript-eslint поддержит TypeScript 7 — обновиться отдельной задачей.
