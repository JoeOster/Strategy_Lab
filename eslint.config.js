// eslint.config.js
import js from '@eslint/js';
import markdown from '@eslint/markdown';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  // 1. Global Ignores
  {
    ignores: ['node_modules/', 'log/'],
  },

  // --- START: FIX ---
  // 2. JavaScript Files Configuration
  // We apply the core JS rules ONLY to .js files.
  {
    files: ['**/*.js'],
    ...js.configs.recommended, // This was the line causing the problem
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.es2021,
      },
    },
  },
  // --- END: FIX ---

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
      'api/**/*.js',
      'services/**/*.js',
      'playwright.config.js',
      'tests/**/*.js',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        document: true,
      },
    },
  },

  // 6. Rules for code blocks inside Markdown
  {
    files: ['**/*.md/*.js'],
    ...js.configs.recommended, // Apply JS rules to code blocks
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
    },
  },
];
