const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string): boolean =>
  EMAIL_RE.test(value.trim());

export const isValidPassword = (value: string): boolean => value.length >= 6;
