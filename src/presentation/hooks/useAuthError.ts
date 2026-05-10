import type { AppError } from '@/types/global';

export const friendlyAuthMessage = (error: AppError | null): string | null => {
  if (!error) return null;
  switch (error.code) {
    case 'AUTH_INVALID':
      return 'That email address looks off. Double-check and try again.';
    case 'AUTH_WRONG_PASSWORD':
      return 'Email or password didn’t match. Try again.';
    case 'AUTH_USER_NOT_FOUND':
      return 'No account with that email yet. Sign up instead?';
    case 'AUTH_EMAIL_IN_USE':
      return 'An account with that email already exists. Try logging in.';
    case 'AUTH_WEAK_PASSWORD':
      return 'Password needs to be at least 6 characters.';
    case 'AUTH_NETWORK':
      return 'No internet connection. Check your network and try again.';
    case 'AUTH_RATE_LIMITED':
      return 'Too many tries. Please wait a moment and retry.';
    case 'AUTH_CANCELLED':
      return null;
    default:
      return 'Something went wrong. Please try again.';
  }
};
