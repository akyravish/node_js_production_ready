/**
 * UTILS FOLDER
 *
 * Purpose: Reusable utility functions and helpers that don't belong to a specific
 * domain. These are pure functions or small utilities used across the application.
 *
 * Best Practices:
 * - Keep functions pure when possible (no side effects)
 * - Make functions generic and reusable
 * - One file per utility category
 * - Document function behavior
 * - Test utility functions thoroughly
 */

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitizes string input by removing HTML tags and trimming
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, ''); // Remove remaining angle brackets
}

/**
 * Formats a date to ISO string or returns null
 */
export function formatDate(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  try {
    return new Date(date).toISOString();
  } catch {
    return null;
  }
}

/**
 * Generates a random alphanumeric string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Delays execution (useful for retries, rate limiting)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely parses JSON string
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
