#!/bin/sh
# Отдельная база для e2e: CMS там работает в production-режиме с миграциями,
# а основную базу dev синхронизирует без миграций (push).
# Выполняется один раз — при первом запуске с пустым томом.
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -c "CREATE DATABASE \"${POSTGRES_DB}_e2e\""
