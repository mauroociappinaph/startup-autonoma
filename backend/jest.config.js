/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/dist/'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@/(.*)\\.js$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.\\.?/.*)\\.js$': '$1',
    '^@startup/db$': '<rootDir>/src/tests/mocks/db.ts'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@prisma|@startup)/)'
  ],

  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: true,
      },
    ],
  },
  setupFiles: ['<rootDir>/src/tests/jest.setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/jest.teardown.ts'],
};
