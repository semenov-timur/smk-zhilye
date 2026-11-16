import type { CollectionConfig } from 'payload'

// Пользователи админки. Доступ по умолчанию: читать и менять могут только
// вошедшие пользователи, анонимный запрос получает 403.
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [],
}
