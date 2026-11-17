import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-plugin-prettier/recommended';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  {
    rules: {
      'no-console': 'error',
    },
  },
  {
    files: [
      'src/components/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
      'src/queries/**/*.{ts,tsx}',
      'src/services/*.service.ts',
      'src/app/**/error.tsx',
      'src/app/global-error.tsx',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/services/http/server', '@/services/*.server', '@/services/*.server.ts'],
              message: 'Client code cannot import server-only services.',
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
