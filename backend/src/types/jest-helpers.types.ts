import { jest } from '@jest/globals';

/**
 * Tipo reutilizable para spies de funciones en tests.
 *
 * Se usa con jest.spyOn() para tipar correctamente el mock
 * sin caer en `any` directo en cada test file.
 *
 * @example
 * ```ts
 * let execSpy: SpiedFunction;
 * execSpy = jest.spyOn(childProcess, 'exec');
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SpiedFunction = jest.MockedFunction<any>;
