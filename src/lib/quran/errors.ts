export class QuranApiError extends Error {
  readonly operation: string;
  readonly status?: number;

  constructor(message: string, operation: string, status?: number) {
    super(message);
    this.name = "QuranApiError";
    this.operation = operation;
    this.status = status;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof QuranApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}
