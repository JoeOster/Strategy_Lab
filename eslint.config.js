// eslint.config.js
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import markdown from 'eslint-plugin-markdown';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  // 1. Global Ignores
  {
    ignores: ['node_modules/', 'log/'],
  },

  // 2. Recommended ESLint rules
  js.configs.recommended,

  // 3. Markdown configuration
  ...markdown.configs.recommended,

  // 4. Prettier configuration
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn',
    },
  },

  // 5. Language and Environment Globals
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.es2021,
      },
    },
  },
  {
    files: ['public/js/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: [
      'server.js',
      'services/**/*.js',
      'playwright.config.js',
      'tests/**/*.js',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // 6. Rules for code blocks inside Markdown
  {
    files: ['**/*.md/*.js'],
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
    },
  },
];
