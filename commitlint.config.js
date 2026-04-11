module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva característica
        'fix',      // Arreglo de bug
        'docs',     // Cambios en documentación
        'style',    // Cambios que no afectan significado (espacios, formateo, etc)
        'refactor', // Cambio de código estructural sin añadir func ni arreglar bugs
        'perf',     // Mejora de performance
        'test',     // Añadir o corregir tests
        'build',    // Cambios que afectan al sistema de compilación o dependencias externas
        'ci',       // Cambios a los archivos y scripts de integración continua
        'chore',    // Actualizaciones de tareas rutinarias
        'revert'    // Revertir un commit previo
      ]
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']]
  }
};
