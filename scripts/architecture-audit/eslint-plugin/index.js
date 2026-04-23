import noDeepImports from './rules/no-deep-imports.js';

export default {
  rules: {
    'no-deep-imports': noDeepImports,
  },
  configs: {
    recommended: {
      plugins: ['architecture'],
      rules: {
        'architecture/no-deep-imports': 'error',
      },
    },
  },
};
