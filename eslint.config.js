// eslint.config.js
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import markdown from 'eslint-plugin-markdown';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // 1. Global Ignores
  {
    ignores: ['node_modules/', 'log/'],
  },

  // 2. Recommended ESLint rules
  js.configs.recommended,

  // 3. Markdown configuration
  // This applies recommended rules to .md files
  ...markdown.configs.recommended,

  // 4. Prettier configuration
  // This must come LAST to override other formatting rules.
  prettierConfig, // Disables conflicting ESLint formatting rules
  {
    // This adds the 'prettier' plugin and enables the rule
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn', // Show Prettier errors as warnings
    },
  },

  // 5. Rules for code blocks inside Markdown
  // This lets you have, e.g., unused vars in example code
  {
    files: ['**/*.md/*.js'],
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
    },
  },
];
