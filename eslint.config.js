import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

const contentImport = {
  name: 'astro:content',
  message:
    'Solo las páginas y BaseLayout leen contenido (loadSite). Pasa los datos por props (plan, regla de capas).',
};

export default defineConfig(
  {
    ignores: [
      'dist/**',
      '.tmp/**',
      '.lighthouseci/**',
      '.astro/**',
      '.claude/**',
      '.agents/**',
      'node_modules/**',
      'tests/fixtures/**',
    ],
  },
  tseslint.configs.recommended,
  astro.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
    },
  },
  // Capa ui/: presentacional, sin acceso a contenido.
  {
    files: ['src/components/ui/**/*.{ts,astro}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [contentImport],
          patterns: [
            {
              group: ['**/lib/content/load', '**/lib/content/load.ts'],
              message: 'ui/ no importa lib/content/load.ts.',
            },
          ],
        },
      ],
    },
  },
  // Capa lib/: lógica pura. Sin astro:content (salvo load.ts) ni components/.
  {
    files: ['src/lib/**/*.ts'],
    ignores: ['src/lib/content/load.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [contentImport],
          patterns: [
            {
              group: ['**/components/**'],
              message: 'lib/ no importa nada de components/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/lib/content/load.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/components/**'],
              message: 'lib/ no importa nada de components/.',
            },
          ],
        },
      ],
    },
  },
);
