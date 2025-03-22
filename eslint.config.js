import pluginJs from '@eslint/js';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  eslintPluginImport.flatConfigs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-unused-vars': 'error',
      'import/no-dynamic-require': 'error'
    }
  },
  {
    languageOptions: { globals: globals.node },
    plugins: {
      prettier: eslintPluginPrettier
    },
    ignores: [
      'package.json',
      'package-lock.json',
      'jest.config.js',
      '.docker/*',
      'node_modules/*',
      'tests/*'
    ]
  }
];
