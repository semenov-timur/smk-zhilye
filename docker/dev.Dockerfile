# Образ для локальной разработки: только Node и pnpm.
# Исходники монтируются томом, зависимости ставит сервис deps.
FROM node:26.13.1-bookworm-slim

# В Node 25+ нет corepack — ставим pnpm напрямую (версия из package.json)
RUN npm install -g pnpm@12.21.0

WORKDIR /app
