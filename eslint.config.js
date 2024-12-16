import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'debian'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Manually added rules

      "no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
      }],

      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
      }],

      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
)
