export type AppErrorCode =
  | 'NETWORK'
  | 'AI_TIMEOUT'
  | 'AI_PARSE_FAIL'
  | 'AUTH_INVALID'
  | 'AUTH_RATE_LIMITED'
  | 'AUTH_EMAIL_IN_USE'
  | 'AUTH_USER_NOT_FOUND'
  | 'AUTH_WRONG_PASSWORD'
  | 'AUTH_WEAK_PASSWORD'
  | 'AUTH_NETWORK'
  | 'AUTH_CANCELLED'
  | 'AUTH_REQUIRES_RECENT_LOGIN'
  | 'PURCHASE_CANCELLED'
  | 'PURCHASE_FAILED'
  | 'SCAN_LIMIT_REACHED'
  | 'PERMISSION_DENIED'
  | 'UNKNOWN';

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'AppError';
  }
}
