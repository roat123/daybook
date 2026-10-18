export const MIN_PASSWORD_LENGTH = 8;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(email));
}

/** Returns what is wrong with the password, or null when it is fine. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters`;
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return 'Use both letters and numbers';
  return null;
}
