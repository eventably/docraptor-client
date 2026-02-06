import js from '@eslint/js';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.commonjs,
        ...globals.es2020,
        log: 'readonly',
      },
    },
    rules: {
      // Preserved from existing .eslintrc
      'brace-style': ['warn', 'stroustrup', { allowSingleLine: true }],
      camelcase: 'off',
      curly: 'error',
      eqeqeq: 'error',
      'new-cap': ['error', { capIsNewExceptions: ['Router'] }],
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-eq-null': 'error',
      'no-unused-expressions': 'error',
      'no-use-before-define': ['error', { functions: false }],
      'no-var': 'warn',
      'one-var': ['error', 'never'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      'wrap-iife': ['error', 'any'],

      // Added: code quality
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'prefer-const': 'error',

      // Added: security
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
    },
  },
  // ESM files (like this config)
  {
    files: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
    },
  },
  // Test files - add Jest globals
  {
    files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**', '*.min.js', 'reports/**'],
  },
];
