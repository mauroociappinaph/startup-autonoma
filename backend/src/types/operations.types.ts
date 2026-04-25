import { OperationsWorkerInput } from "@startup/shared";

export type { OperationsWorkerInput };

export type OperationsWorkerResult = {
  success: boolean;
  action: string;
  stdout?: string;
  stderr?: string;
  errorMessage?: string;
};

export interface ExecError extends Error {
  stdout?: string;
  stderr?: string;
}
