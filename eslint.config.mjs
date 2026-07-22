import js from '@eslint/js';
import globals from 'globals';
import nodePlugin from 'eslint-plugin-n';
import promisePlugin from 'eslint-plugin-promise';
import sonarjs from 'eslint-plugin-sonarjs';
import security from 'eslint-plugin-security';
import unicorn from 'eslint-plugin-unicorn';
import importX from 'eslint-plugin-import-x';
import noSecrets from 'eslint-plugin-no-secrets';
import jsdoc from 'eslint-plugin-jsdoc';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    plugins: {
      n: nodePlugin,
      promise: promisePlugin,
      sonarjs,
      security,
      unicorn,
      'import-x': importX,
      'no-secrets': noSecrets,
      jsdoc,
    },
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
      // Style (preserved from prior config)
      // Note: `brace-style` removed — conflicts with Prettier, which owns formatting.
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
        { anonymous: 'always', named: 'never', asyncArrow: 'always' },
      ],
      'wrap-iife': ['error', 'any'],

      // Code quality
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'prefer-const': 'error',

      // Core security
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // File/function size (lightweight for this small API)
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 75, skipBlankLines: true, skipComments: true }],
      complexity: ['warn', { max: 10 }],
      'max-depth': ['warn', 4],
      'max-nested-callbacks': ['warn', 3],
      'max-params': ['warn', 4],

      // sonarjs — code smells
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 4 }],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/no-small-switch': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/no-useless-catch': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',

      // security — Node/Express
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'error',

      // unicorn — modern JS (tuned for CJS Node)
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/filename-case': ['error', { cases: { kebabCase: true, pascalCase: true } }],

      // n — Node-specific
      'n/no-deprecated-api': 'error',
      'n/no-process-exit': 'error',
      'n/no-sync': ['warn', { allowAtRootLevel: true }],
      'n/prefer-promises/fs': 'error',
      'n/prefer-promises/dns': 'error',

      // promise — async correctness
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-nesting': 'warn',

      // import-x — import hygiene (CJS subset)
      'import-x/no-self-import': 'error',
      'import-x/no-useless-path-segments': 'error',
      'import-x/no-duplicates': 'error',

      // jsdoc — TSDoc-ish comments on exports (lenient for CJS)
      'jsdoc/check-alignment': 'warn',
      'jsdoc/check-param-names': 'warn',
      'jsdoc/check-tag-names': ['warn', { definedTags: ['remarks', 'public', 'internal'] }],
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns-description': 'warn',
      'jsdoc/no-undefined-types': 'off',

      // no-secrets — pasted API keys/tokens
      'no-secrets/no-secrets': [
        'error',
        { tolerance: 4.5, ignoreContent: ['https?://', 'data:image/'] },
      ],
    },
  },
  // ESM files (like this config)
  {
    files: ['**/*.mjs'],
    languageOptions: { sourceType: 'module' },
  },
  // Test files — Jest globals and relaxed limits
  {
    files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: { globals: { ...globals.jest } },
    rules: {
      'max-lines-per-function': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'no-secrets/no-secrets': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.min.js',
      'reports/**',
      'logs/**',
    ],
  },
];
