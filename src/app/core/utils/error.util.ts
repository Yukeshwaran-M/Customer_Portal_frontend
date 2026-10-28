import { ApiError } from '../models/api-error';

/** One consistent way to turn any thrown value into a user-facing message. */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
