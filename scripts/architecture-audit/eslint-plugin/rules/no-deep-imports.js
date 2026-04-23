export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prohibit deep relative imports (../..). Use path aliases instead.',
    },
    fixable: null,
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value.startsWith('../../')) {
          context.report({
            node,
            message: "🚨 [LEY #10] Import relativo profundo detectado. Usá path aliases (@/).",
          });
        }
      },
    };
  },
};
