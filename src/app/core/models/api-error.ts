export type ApiErrorCode = 'DUPLICATE_EMAIL' | 'NOT_FOUND' | 'SERVER_ERROR' | 'VALIDATION' | 'NETWORK';

export const API_ERROR_CODES: readonly ApiErrorCode[] = [
  'DUPLICATE_EMAIL',
  'NOT_FOUND',
  'SERVER_ERROR',
  'VALIDATION',
  'NETWORK',
];

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number = 500,
    readonly code?: ApiErrorCode,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
