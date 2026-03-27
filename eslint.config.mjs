import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

// ─── Shared base rules applied to all TS files ───────────────────────────────
const baseRules = {
  ...js.configs.recommended.rules,
  ...tsPlugin.configs.recommended.rules,

  // Unused vars: error with pragmatic escape hatch for _ prefixed names
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    },
  ],

  // any is a bug waiting to happen — treat it as an error, not a warning
  '@typescript-eslint/no-explicit-any': 'error',

  // Unused expressions (e.g. `x && doSomething()` with no assignment)
  '@typescript-eslint/no-unused-expressions': 'error',

  // Consistent type-only imports — keeps bundles clean, avoids circular dep issues
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
  ],

  // Prefer T[] over Array<T> for simple types
  '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],

  // ── General JS best practices ──────────────────────────────────────────────

  // Always use === unless comparing to null (where == null catches undefined too)
  eqeqeq: ['error', 'always', { null: 'ignore' }],

  // Prefer const wherever re-assignment doesn't happen
  'prefer-const': 'error',

  // Template literals over string concatenation
  'prefer-template': 'error',

  // Shadowing outer-scope variables causes confusing bugs (use TS version to avoid conflicts)
  'no-shadow': 'off',
  '@typescript-eslint/no-shadow': 'error',

  // Catch empty catch blocks silently swallowing errors
  'no-empty': ['error', { allowEmptyCatch: false }],
};

// ─── Shared TS language options factory ──────────────────────────────────────
const tsLanguageOptions = (extraGlobals = {}) => ({
  parser: tsParser,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  globals: {
    ...globals.es2021,
    ...extraGlobals,
  },
});

export default [
  // ─── Global ignores ──────────────────────────────────────────────────────
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/prisma/migrations/**',
      '**/prisma/generated/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
      '**/vitest.setup.ts',
    ],
  },

  // ─── Backend ─────────────────────────────────────────────────────────────
  {
    files: ['backend/**/*.ts'],
    languageOptions: tsLanguageOptions(globals.node),
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...baseRules,
    },
  },

  // ─── Frontend ────────────────────────────────────────────────────────────
  {
    files: ['frontend/**/*.ts', 'frontend/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        React: 'readonly',
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...baseRules,
    },
  },

  // ─── Shared ──────────────────────────────────────────────────────────────
  {
    files: ['shared/**/*.ts'],
    languageOptions: tsLanguageOptions(globals.node),
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...baseRules,
      // Shared types/utils should never have side effects or platform assumptions
      'no-console': 'error',
    },
  },

  // ─── Test files — relax rules that make tests awkward ────────────────────
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/__tests__/**/*.ts',
      '**/__tests__/**/*.tsx',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
    },
  },
];
