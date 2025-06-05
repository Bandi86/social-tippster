import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier';
// Remove the ESM import of the parser
// import typescriptParser from '@typescript-eslint/parser';
const typescriptParser = require('@typescript-eslint/parser');

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescript,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      ...typescript.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  prettier,
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.next/',
      'coverage/',
      'frontend/node_modules/',
      'backend/node_modules/',
      'frontend/.next/',
      'backend/dist/',
      '**/archived/**',
      'archived/**',
      'docs/archived/**',
      'tests/archived/**',
    ],
  },
];
