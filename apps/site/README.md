# apps/site — сайт на Astro

Astro в режиме SSR (Node-адаптер, `standalone`) и Tailwind CSS 4.
Страница собирается на сервере при каждом запросе, данные берутся из CMS
по REST API. Адрес CMS для сервера сайта — переменная `CMS_API_URL`.

| Путь | Что это |
|---|---|
| `src/pages/` | Страницы. Сейчас только техническая заглушка `index.astro` |
| `src/lib/cms.ts` | Обращения к CMS |
| `src/styles/global.css` | Подключение Tailwind |
| `e2e/` | E2E-тесты (Playwright), ширина 360 и 1280 px |

Команды — в корневом `README.md`. Переменные — в корневом `.env.example`.
