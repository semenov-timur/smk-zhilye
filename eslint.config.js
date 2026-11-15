// @ts-check
import eslintPluginAstro from 'eslint-plugin-astro'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.astro/**',
      '**/.next/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      // Файлы, которые генерирует Payload
      'apps/cms/src/payload-types.ts',
      'apps/cms/src/app/(payload)/admin/importMap.js',
      'apps/cms/src/migrations/**',
      'apps/cms/next-env.d.ts',
    ],
  },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  prettier,
)
