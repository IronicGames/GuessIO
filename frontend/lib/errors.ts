export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 403:
        return "You don't have permission to do that.";
      case 404:
        return 'That resource could not be found.';
      case 409:
        return 'There was a conflict with an existing resource.';
      default:
        return error.message ?? 'Something went wrong.';
    }
  }
  return 'An unexpected error occurred.';
}
