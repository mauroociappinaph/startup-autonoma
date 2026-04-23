import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import archPlugin from 'eslint-plugin-architecture';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      architecture: archPlugin,
    },
    linterOptions: {
      reportUnusedDisableDirectives: false
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-console": "off",
      "architecture/no-deep-imports": "error"
    }
  }
);
